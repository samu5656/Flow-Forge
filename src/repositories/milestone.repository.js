import prisma from "../lib/prisma.js";

export const createMilestone = async (data) => {
    return prisma.milestone.create({
        data
    });
};

export const findMilestonesByProject = async (projectId) => {
    return prisma.milestone.findMany({
        where: {
            projectId,
        },
        orderBy: {
            dueDate: "asc"
        }
    });
};

export const findMilestoneById = async (milestoneId, projectId) => {
    return prisma.milestone.findFirst({
        where: {
            id: milestoneId,
            projectId,
        }
    });
};

export const updateMilestone = async (milestoneId, projectId, data) => {
    return prisma.milestone.update({
        where: {
            id: milestoneId,
        },
        data
    });
};

export const deleteMilestone = async (milestoneId, projectId) => {
    return prisma.milestone.delete({
        where: {
            id: milestoneId,
        }
    });
};
