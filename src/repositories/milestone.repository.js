import prisma from "../lib/prisma.js";

export const createMilestone = async (data) => {
    return prisma.milestone.create({
        data
    });
};

export const findMilestonesByProject = async (
    projectId
) => {
    return prisma.milestone.findMany({
        where: {
            projectId,
            project:{
                organizationId
            }
        },
        orderBy: {
            dueDate: "asc"
        }
    });
};

export const findMilestoneById = async (
    milestoneId,
    projectId
) => {
    return prisma.milestone.findFirst({
        where: {
            id: milestoneId,
            projectId,
            project:{
                organizationId
            }
        }
    });
};

export const updateMilestone = async (
    milestoneId,
    projectId,
    data
) => {
    return prisma.milestone.updateMany({
        where: {
            id: milestoneId,
            projectId,
            project:{
                organizationId
            }
        },
        data
    });
};

export const deleteMilestone = async (
    milestoneId,
    projectId
) => {
    return prisma.milestone.deleteMany({
        where: {
            id: milestoneId,
            projectId,
            project:{
                organizationId
            }
        }
    });
};