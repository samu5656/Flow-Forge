import express from "express";
import requireOrganizationMembership from "../middleware/organization.middlaware.js";
import authorize from "../middleware/authorize.middleware.js";
import { createTeam,getTeams,getTeam,updateTeam,deleteTeam} from "../controllers/team.contoller.js";
import { createTeamSchema } from "../validators/team.validator.js";
import { createOrganization, deleteOrganizationController, getOgranization, getOgranizations, updateOrganizationController } from "../controllers/organization.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createOrganizationSchema, updateOrganizationSchema } from "../validators/organization.validator.js";
import { createProject,getProject,getProjects,updateProject,deleteProject } from "../controllers/projects.controller.js";
const router = express.Router();

router.post("/",authenticate,validate(createOrganizationSchema) ,createOrganization);
router.get("/:id",getOgranization);
router.patch("/:id",validate(updateOrganizationSchema),updateOrganizationController);
router.delete("/:id",deleteOrganizationController);
router.get("/",getOgranizations);

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

export default router;