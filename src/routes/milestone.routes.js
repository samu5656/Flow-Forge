import express from "express";

import {
    createMilestone,
    getMilestones,
    getMilestone,
    updateMilestone,
    deleteMilestone
} from "../controllers/milestone.controller.js";

import  authenticate  from "../middleware/auth.middleware.js";

import requireOrganizationMembership from "../middleware/organization.middlaware.js";

import authorize from "../middleware/authorize.middleware.js";

import validate  from "../middleware/validate.middleware.js";
import {
    createMilestoneSchema,
    updateMilestoneSchema
} from "../validators/milestone.validator.js";

const router = express.Router();

router.post(
    "/organizations/:organizationId/projects/:projectId/milestones",
    authenticate,
    requireOrganizationMembership,
    authorize("milestone:create"),
    validate(createMilestoneSchema),
    createMilestone
);

router.get(
    "/organizations/:organizationId/projects/:projectId/milestones",
    authenticate,
    requireOrganizationMembership,
    authorize("milestone:read"),
    getMilestones
);

router.get(
    "/organizations/:organizationId/projects/:projectId/milestones/:milestoneId",
    authenticate,
    requireOrganizationMembership,
    authorize("milestone:read"),
    getMilestone
);

router.patch(
    "/organizations/:organizationId/projects/:projectId/milestones/:milestoneId",
    authenticate,
    requireOrganizationMembership,
    authorize("milestone:update"),
    validate(updateMilestoneSchema),
    updateMilestone
);

router.delete(
    "/organizations/:organizationId/projects/:projectId/milestones/:milestoneId",
    authenticate,
    requireOrganizationMembership,
    authorize("milestone:delete"),
    deleteMilestone
);

export default router;