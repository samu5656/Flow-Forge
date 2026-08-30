import {
    createProject,
    findProjectsByOrganization,
    findProjectById
} from "../repositories/project.repository.js";

export const createProjectService = async (
    data,
    organizationId
) => {
    return createProject({
        ...data,
        organizationId
    });
};

export const getProjectsService = async (
    organizationId
) => {
    return findProjectsByOrganization(
        organizationId
    );
};

export const getProjectService = async (
    projectId,
    organizationId
) => {
    return findProjectById(
        projectId,
        organizationId
    );
};