import prisma from "../lib/prisma.js";

export const createLabel = async (data) => {
    return prisma.label.create({
        data
    });
};

export const findLabelsByProject = async (projectId) => {
    return prisma.label.findMany({
        where: {
            projectId,
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const findLabelById = async (labelId, projectId) => {
    return prisma.label.findFirst({
        where: {
            id: labelId,
            projectId,
        }
    });
};

export const updateLabel = async (labelId, projectId, data) => {
    return prisma.label.update({
        where: {
            id: labelId,
        },
        data
    });
};

export const deleteLabel = async (labelId, projectId) => {
    return prisma.label.delete({
        where: {
            id: labelId,
        }
    });
};
