import express from "express";
import requireOrganizationMembership from "../middleware/organization.middlaware.js";
import authorize from "../middleware/authorize.middleware.js";
import { createTeam, getTeams, getTeam, updateTeam, deleteTeam, addTeamMember, removeTeamMember, getOrgMembers } from "../controllers/team.contoller.js";
import { createTeamSchema } from "../validators/team.validator.js";
import { createOrganization, deleteOrganizationController, getOgranization, getOgranizations, updateOrganizationController } from "../controllers/organization.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createOrganizationSchema, updateOrganizationSchema } from "../validators/organization.validator.js";
import { createProject, getProject, getProjects, updateProject, deleteProject } from "../controllers/projects.controller.js";
import { chatWithProjectAI } from "../controllers/ai.controller.js";
import { chatSchema } from "../validators/ai.validator.js";
import { createProjectDocument, getProjectDocuments, deleteProjectDocument } from "../controllers/document.controller.js";

const router = express.Router();

router.post("/", authenticate, validate(createOrganizationSchema), createOrganization);
router.get("/:id", getOgranization);
router.patch("/:id", validate(updateOrganizationSchema), updateOrganizationController);
router.delete("/:id", deleteOrganizationController);
router.get("/", getOgranizations);

//organization members
router.get(
    "/:organizationId/members",
    authenticate,
    requireOrganizationMembership,
    getOrgMembers
);

//team-routes
router.post(
    "/:organizationId/teams",
    authenticate,
    requireOrganizationMembership,
    authorize("team:create"),
    validate(createTeamSchema),
    createTeam
);
router.get(
    "/:organizationId/teams",
    authenticate,
    requireOrganizationMembership,
    authorize("team:read"),
    getTeams
);
router.get(
    "/:organizationId/teams/:teamId",
    authenticate,
    requireOrganizationMembership,
    getTeam
);
router.patch(
    "/:organizationId/teams/:teamId",
    authenticate,
    requireOrganizationMembership,
    updateTeam
);
router.delete(
    "/:organizationId/teams/:teamId",
    authenticate,
    requireOrganizationMembership,
    deleteTeam
);
router.post(
    "/:organizationId/teams/:teamId/members",
    authenticate,
    requireOrganizationMembership,
    addTeamMember
);
router.delete(
    "/:organizationId/teams/:teamId/members/:userId",
    authenticate,
    requireOrganizationMembership,
    removeTeamMember
);

//project-routes
router.post(
    "/:organizationId/projects",
    authenticate,
    requireOrganizationMembership,
    createProject
);

router.get(
    "/:organizationId/projects",
    authenticate,
    requireOrganizationMembership,
    getProjects
);

router.get(
    "/:organizationId/projects/:projectId",
    authenticate,
    requireOrganizationMembership,
    getProject
);

router.patch(
    "/:organizationId/projects/:projectId",
    authenticate,
    requireOrganizationMembership,
    updateProject
);

router.delete(
    "/:organizationId/projects/:projectId",
    authenticate,
    requireOrganizationMembership,
    deleteProject
);

//ai-chat-routes
router.post(
    "/:organizationId/projects/:projectId/ai/chat",
    authenticate,
    requireOrganizationMembership,
    validate(chatSchema),
    chatWithProjectAI
);

//document-rag-routes
router.post(
    "/:organizationId/projects/:projectId/documents",
    authenticate,
    requireOrganizationMembership,
    createProjectDocument
);

router.get(
    "/:organizationId/projects/:projectId/documents",
    authenticate,
    requireOrganizationMembership,
    getProjectDocuments
);

router.delete(
    "/:organizationId/projects/:projectId/documents/:documentId",
    authenticate,
    requireOrganizationMembership,
    deleteProjectDocument
);

export default router;
