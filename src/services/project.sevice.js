import {
    createProject,
    findProjectsByOrganization,
    findProjectById,
    updateProject,
    deleteProject
} from "../repositories/project.repository.js";

import {
    getCache,
    setCache,
    deleteCache,
    deleteCacheByPattern
} from "../utils/cache.js";

// ========== KEY NAMING CONVENTION ==========
// Single project:   "project:<orgId>:<projectId>"
// Project list:     "projects:<orgId>"
//
// Why include orgId? So we never accidentally serve
// Org-A's project data to Org-B (cache-level tenant isolation).

export const createProjectService = async (
    data,
    organizationId
) => {
    const project = await createProject({
        ...data,
        organizationId
    });

    // Invalidate the project LIST cache for this org
    // because a new project was added
    await deleteCache(`projects:${organizationId}`);

    return project;
};

export const getProjectsService = async (
    organizationId
) => {

    const cacheKey = `projects:${organizationId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
        console.log(`Cache HIT:${cacheKey}`);
        return cached;
    }
    console.log(`Cache MISS: ${cacheKey}`);
    const projects = await findProjectsByOrganization(organizationId);

    await setCache(cacheKey, projects, 60);

    return projects;
};

export const getProjectService = async (
    projectId,
    organizationId
) => {
    const cacheKey = `project:${organizationId}:${projectId}`;
    // 1. Try cache
    const cached = await getCache(cacheKey);
    if (cached) {
        console.log(`Cache HIT: ${cacheKey}`);
        return cached;
    }
    // 2. Cache miss
    console.log(`Cache MISS: ${cacheKey}`);
    const project = await findProjectById(projectId, organizationId);
    // 3. Only cache if project exists
    if (project) {
        await setCache(cacheKey, project, 60);
    }
    return project;
};

export const updateProjectService = async (projectId, organizationId, data) => {
    const existingProject = await findProjectById(projectId, organizationId);

    if (!existingProject) {
        return null;
    }

    const updated = await updateProject(projectId, organizationId, data);

    await deleteCache(`project:${organizationId}:${projectId}`);
    await deleteCache(`projects:${organizationId}`);

    return updated;
}


export const deleteProjectService = async (projectId, organizationId) => {
    const existingProject = await findProjectById(projectId, organizationId);

    if (!existingProject) {
        return null;
    }

    await deleteProject(projectId, organizationId);

    // Invalidate both caches
    await deleteCache(`project:${organizationId}:${projectId}`);
    await deleteCache(`projects:${organizationId}`);

    return existingProject;
}