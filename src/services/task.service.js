import {
    createTask,
    findTasksByIssue,
    findTaskById,
    updateTask,
    deleteTask
} from "../repositories/task.repository.js";

export const createTaskService = async (
    data,
    issueId
) => {
    return createTask({
        ...data,
        issueId
    });
};

export const getTasksService = async (
    issueId
) => {
    return findTasksByIssue(issueId);
};

export const getTaskService = async (
    taskId,
    issueId
) => {
    return findTaskById(
        taskId,
        issueId
    );
};

export const updateTaskService = async (
    taskId,
    issueId,
    data
) => {
    const task = await findTaskById(
        taskId,
        issueId
    );

    if (!task) {
        return null;
    }

    const result = await updateTask(
        taskId,
        issueId,
        data
    );

    if (result.count === 0) {
        return null;
    }

    return findTaskById(
        taskId,
        issueId
    );
};

export const deleteTaskService = async (
    taskId,
    issueId
) => {
    const task = await findTaskById(
        taskId,
        issueId
    );

    if (!task) {
        return false;
    }

    const result = await deleteTask(
        taskId,
        issueId
    );

    return result.count > 0;
};