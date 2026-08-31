import prisma from "../lib/prisma.js";

export const createTask = async (data) => {
    return prisma.task.create({
        data
    });
};
//tenant nesting
export const findTasksByIssue = async (
    issueId
) => {
    return prisma.task.findMany({
        where: {
            issueId,
            issue:{
                project:{
                    organizationId
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const findTaskById = async (
    taskId,
    issueId
) => {
    return prisma.task.findFirst({
        where: {
            id: taskId,
            issueId,
            issue:{
                project:{
                    organizationId
                }
            }
        }
    });
};

export const updateTask = async (
    taskId,
    issueId,
    data
) => {
    return prisma.task.updateMany({
        where: {
            id: taskId,
            issueId,
            issue:{
                project:{
                    organizationId
                }
            }
        },
        data
    });
};

export const deleteTask = async (
    taskId,
    issueId
) => {
    return prisma.task.deleteMany({
        where: {
            id: taskId,
            issueId,
            issue:{
                project:{
                    organizationId
                }
            }
        }
    });
};