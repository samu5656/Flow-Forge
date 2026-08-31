import prisma from "../lib/prisma.js";

export const createLabel = async (data) => {
    return prisma.label.create({
        data
    });
};

export const findLabelsByProject = async (
    projectId
) => {
    return prisma.label.findMany({
        where: {
            projectId,
            project:{
                organizationId
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const findLabelById = async (
    labelId,
    projectId
) => {
    return prisma.label.findFirst({
        where: {
            id: labelId,
            projectId,
            project:{
                organizationId
            }
        }
    });
};

export const updateLabel = async (
    labelId,
    projectId,
    data
) => {
    return prisma.label.updateMany({
        where: {
            id: labelId,
            projectId,
            project:{
                organizationId
            }
        },
        data
    });
};

export const deleteLabel = async (
    labelId,
    projectId
) => {
    return prisma.label.deleteMany({
        where: {
            id: labelId,
            projectId,
            project:{
                organizationId
            }
        }
    });
};