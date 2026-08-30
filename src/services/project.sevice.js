import {
    createProject,
    findProjectsByOrganization,
    findProjectById,
    updateProject,
    deleteProject
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

export const updateProjectService = async(projectId,organizationId,data)=>{
    const existingProject = await findProjectById(projectId,organizationId);

    if(!existingProject){
        return null;
    }
//returns count:1
    return updateProject(projectId,organizationId,data);
}


export const deleteProjectService = async(projectId,organizationId)=>{
    const existingProject = await findProjectById(projectId,organizationId);

    if(!existingProject){
        return null;
    }

    await deleteProject(projectId,organizationId);

    return existingProject;
}