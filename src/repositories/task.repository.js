import prisma from "../lib/prisma.js";

export const createTask = async (data) => {
    return prisma.task.create({
        data
    });
};

export const findTasksByIssue = async (issueId) => {
    return prisma.task.findMany({
        where: {
            issueId,
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const findTaskById = async (taskId, issueId) => {
    return prisma.task.findFirst({
        where: {
            id: taskId,
            issueId,
        }
    });
};

export const updateTask = async (taskId, issueId, data) => {
    return prisma.task.update({
        where: {
            id: taskId,
        },
        data
    });
};

export const deleteTask = async (taskId, issueId) => {
    return prisma.task.delete({
        where: {
            id: taskId,
        }
    });
};
