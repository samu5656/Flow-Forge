import {
    createTaskService,
    getTasksService,
    getTaskService,
    updateTaskService,
    deleteTaskService
} from "../services/task.service.js";

export const createTask = async (req, res, next) => {
    try {
        const task = await createTaskService(
            req.body,
            req.params.issueId
        );

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

export const getTasks = async (req, res, next) => {
    try {
        const tasks = await getTasksService(
            req.params.issueId
        );

        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        next(error);
    }
};

export const getTask = async (req, res, next) => {
    try {
        const task = await getTaskService(
            req.params.taskId,
            req.params.issueId
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const task = await updateTaskService(
            req.params.taskId,
            req.params.issueId,
            req.body
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req, res, next) => {
    try {
        const deleted = await deleteTaskService(
            req.params.taskId,
            req.params.issueId
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};