import express from "express";

import authenticate
    from "../middleware/auth.middleware.js";

import requireOrganizationMembership
    from "../middleware/organization.middlaware.js";

import authorize
    from "../middleware/authorize.middleware.js";

import validate
    from "../middleware/validate.middleware.js";

import { verifyGithubSignature } from "../middleware/githubWebhook.middleware.js";
import { handleGithubWebhook } from "../controllers/github.controller.js";

import {
    connectGithub,
    githubCallback,
    getGithubRepos,
    connectRepositoryToProject,
    getProjectRepositories,
    getProjectRepository,
    disconnectRepository,
    disconnectGithub
} from "../controllers/github.controller.js";

import {
    connectGithubRepositorySchema
} from "../validators/github.validator.js";

const router = express.Router();

/*
 * GitHub OAuth
 */

/*
 * Start GitHub OAuth.
 *
 * JWT is required here because we need to know
 * which FlowForge user is connecting GitHub.
 */
router.get(
    "/github/connect",
    authenticate,
    connectGithub
);

/*
 * OAuth callback.
 *
 * No JWT middleware here.
 *
 * The user is recovered through OAuth state.
 */
router.get(
    "/github/callback",
    githubCallback
);

/*
 * Get repositories from GitHub.
 */
router.get(
    "/github/repositories",
    authenticate,
    getGithubRepos
);

/*
 * Disconnect GitHub account.
 */
router.delete(
    "/github/disconnect",
    authenticate,
    disconnectGithub
);


/*
 * Project GitHub integration
 */

/*
 * Get GitHub repositories connected
 * to a FlowForge project.
 */
router.get(
    "/organizations/:organizationId/projects/:projectId/github",
    authenticate,
    requireOrganizationMembership,
    authorize("project:read"),
    getProjectRepositories
);

/*
 * Get one connected repository.
 */
router.get(
    "/organizations/:organizationId/projects/:projectId/github/:repositoryId",
    authenticate,
    requireOrganizationMembership,
    authorize("project:read"),
    getProjectRepository
);

/*
 * Connect GitHub repository to project.
 */
router.post(
    "/organizations/:organizationId/projects/:projectId/github",
    authenticate,
    requireOrganizationMembership,
    authorize("project:update"),
    validate(connectGithubRepositorySchema),
    connectRepositoryToProject
);

/*
 * Disconnect GitHub repository.
 */
router.delete(
    "/organizations/:organizationId/projects/:projectId/github/:repositoryId",
    authenticate,
    requireOrganizationMembership,
    authorize("project:update"),
    disconnectRepository
);

router.post('/github/webhook', verifyGithubSignature, handleGithubWebhook);

export default router;