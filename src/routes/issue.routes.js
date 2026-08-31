import express from "express";

import {
    createIssue, getIssueById, getIssuesByProject, updateIssue, deleteIssue
} from "../controllers/issue.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import requireOrganizationMembership from "../middleware/organization.middlaware.js";
import authorize from "../middleware/authorize.middleware.js";

import validate  from "../middleware/validate.middleware.js";

import {
    createIssueSchema,
    updateIssueSchema
} from "../validators/issue.validator.js";

const router = express.Router();

router.post(
    "/organizations/:organizationId/projects/:projectId/issues",
    authenticate,
    requireOrganizationMembership,
    authorize("issue:create"),
    validate(createIssueSchema),
    createIssue
);

router.get(
    "/organizations/:organizationId/projects/:projectId/issues",
    authenticate,
    requireOrganizationMembership,
    authorize("issue:read"),
    getIssuesByProject
);

router.get(
    "/organizations/:organizationId/projects/:projectId/issues/:issueId",
    authenticate,
    requireOrganizationMembership,
    authorize("issue:read"),
    getIssueById
);

router.patch(
    "/organizations/:organizationId/projects/:projectId/issues/:issueId",
    authenticate,
    requireOrganizationMembership,
    authorize("issue:update"),
    validate(updateIssueSchema),
    updateIssue
);

router.delete(
    "/organizations/:organizationId/projects/:projectId/issues/:issueId",
    authenticate,
    requireOrganizationMembership,
    authorize("issue:delete"),
    deleteIssue
);

export default router;