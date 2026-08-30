import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import requireOrganizationMembership from "../middleware/organization.middlaware.js";
import authorize from "../middleware/authorize.middleware.js";
import { createTeam,getTeams } from "../controllers/team.contoller.js";
import validate from "../middleware/validate.middleware.js";

const router = express.Router();
router.post(
    "/organizations/:organizationId/teams",
    authenticate,
    requireOrganizationMembership,
    authorize("team:create"),
    validate(createTeamSchema),
    createTeam
);
router.get(
    "/organizations/:organizationId/teams",
    authenticate,
    requireOrganizationMembership,
    authorize("team:read"),
    getTeams
);