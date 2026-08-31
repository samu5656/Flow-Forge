import express from "express";

import {
    createLabel,
    getLabels,
    getLabel,
    updateLabel,
    deleteLabel
} from "../controllers/label.controller.js";

import  authenticate  from "../middleware/auth.middleware.js";

import requireOrganizationMembership from "../middleware/organization.middlaware.js";

import authorize from "../middleware/authorize.middleware.js";

import validate  from "../middleware/validate.middleware.js";

import {
    createLabelSchema,
    updateLabelSchema
} from "../validators/label.validator.js";

const router = express.Router();

router.post(
    "/organizations/:organizationId/projects/:projectId/labels",
    authenticate,
    requireOrganizationMembership,
    authorize("label:create"),
    validate(createLabelSchema),
    createLabel
);

router.get(
    "/organizations/:organizationId/projects/:projectId/labels",
    authenticate,
    requireOrganizationMembership,
    authorize("label:read"),
    getLabels
);

router.get(
    "/organizations/:organizationId/projects/:projectId/labels/:labelId",
    authenticate,
    requireOrganizationMembership,
    authorize("label:read"),
    getLabel
);

router.patch(
    "/organizations/:organizationId/projects/:projectId/labels/:labelId",
    authenticate,
    requireOrganizationMembership,
    authorize("label:update"),
    validate(updateLabelSchema),
    updateLabel
);

router.delete(
    "/organizations/:organizationId/projects/:projectId/labels/:labelId",
    authenticate,
    requireOrganizationMembership,
    authorize("label:delete"),
    deleteLabel
);

export default router;