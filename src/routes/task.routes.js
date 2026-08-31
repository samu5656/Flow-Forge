import express from "express";

import {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask
} from "../controllers/task.controller.js";

import  authenticate  from "../middleware/auth.middleware.js";

import requireOrganizationMembership from "../middleware/organization.middlaware.js";

import authorize from "../middleware/authorize.middleware.js";

import validate  from "../middleware/validate.middleware.js";

import {
    createTaskSchema,
    updateTaskSchema
} from "../validators/task.validator.js";

const router = express.Router();

router.post(
    "/organizations/:organizationId/projects/:projectId/issues/:issueId/tasks",
    authenticate,
    requireOrganizationMembership,
    authorize("task:create"),
    validate(createTaskSchema),
    createTask
);

router.get(
    "/organizations/:organizationId/projects/:projectId/issues/:issueId/tasks",
    authenticate,
    requireOrganizationMembership,
    authorize("task:read"),
    getTasks
);

router.get(
    "/organizations/:organizationId/projects/:projectId/issues/:issueId/tasks/:taskId",
    authenticate,
    requireOrganizationMembership,
    authorize("task:read"),
    getTask
);

router.patch(
    "/organizations/:organizationId/projects/:projectId/issues/:issueId/tasks/:taskId",
    authenticate,
    requireOrganizationMembership,
    authorize("task:update"),
    validate(updateTaskSchema),
    updateTask
);

router.delete(
    "/organizations/:organizationId/projects/:projectId/issues/:issueId/tasks/:taskId",
    authenticate,
    requireOrganizationMembership,
    authorize("task:delete"),
    deleteTask
);

export default router;