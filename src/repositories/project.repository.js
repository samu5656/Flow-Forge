import prisma from "../lib/prisma.js";

export const createProject = async (data) => {
    return prisma.project.create({
        data
    });
};

export const findProjectsByOrganization = async (
    organizationId
) => {
    return prisma.project.findMany({
        where: {
            organizationId
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const findProjectById = async (
    projectId,
    organizationId
) => {
    return prisma.project.findFirst({
        where: {
            id: projectId,
            organizationId
        }
    });
};

export const updateProject = async(projectId,organizationId,data)=>{
    return prisma.project.updateMany({
        where:{
            id:projectId,
            organizationId
        },
        data
    });
};

export const deleteProject = async(projectId,organizationId)=>{
    return prisma.project.deleteMany({
        where:{
            id:projectId,
            organizationId
        }
    });
};