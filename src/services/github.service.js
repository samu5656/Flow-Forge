import axios from "axios";
import crypto from "crypto";
import {
    findGithubAccountByUserId,
    findGithubAccountByGithubId,
    createGithubAccount,
    updateGithubAccount,
    deleteGithubAccount,
    createProjectRepository,
    findProjectRepositories,
    findProjectRepositoryById,
    deleteProjectRepository
} from "../repositories/github.repositories.js";

import prisma from "../lib/prisma.js";
import AppError from "../utils/AppError.js";
import { stat } from "fs";

const oauthStates = new Map();

//create Oauth state

export const createGithubOAuthState = (userId) => {
    const state = crypto.randomBytes(32).toString("hex");

    oauthStates.set(state, {
        userId,
        createdAt: Date.now()
    });
    return state;
}

export const validateGithubOAuthState = (state) => {
    const oauthData = oauthStates.get(state);

    if (!oauthData) {
        throw new AppError("Invalid OAuth state", 400);
    }

    const expiryTime = 5 * 60 * 1000;

    if (Date.now() - oauthData.createdAt > expiryTime) {
        oauthStates.delete(state);
        throw new AppError("OAuth State expired", 400);
    }

    //state is single use.

    oauthStates.delete(state);

    return oauthData.userId;
}

//github authorization URL

export const getGithubAuthorizationUrl = (state) => {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,

        /*
         * repo:
         * Allows access to repositories.
         *
         * read:user:
         * Allows reading GitHub user information.
         *
         * user:email:
         * Allows reading user's email.
         */

        scope: "repo read:user user:email", state
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

//exchange github auth code for access token
export const exchangeGithubCode = async (code) => {
    try {
        const response = await axios.post("https://github.com/login/oauth/access_token", {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,

            code,

            redirect_uri: process.env.GITHUB_CALLBACK_URL
        },
            {
                headers: {
                    Accept: "application/json"
                }
            }
        );

        if (!response.data.access_token) {
            throw new AppError("GitHub access token was not returned", 400);
        }

        return response.data.access_token;
    }
    catch (error) {

        console.error("GitHub token exchange error:",
            error.response?.data ||
            error.message
        );

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError("Failed to authenticate with GitHub", 400);
    }
};

export const getGithubUser = async (accessToken) => {
    try {
        const response = await axios.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json"
            }
        });
        return response.data;
    } catch (err) {
        console.error(err)(
            "Github user API error:", err.response?.data || err.message
        )
        throw new AppError(
            "Failed to fetch GitHub user",
            400
        );
    }
}

export const connectGithubAccount = async (userId, code) => {
    const accessToken = await exchangeGithubCode(code);
    const githubUser = await getGithubUser(accessToken);

    //prevent one gthub account from being connected to multiple flowforge users.

    const accountWithGithubId = await findGithubAccountByGithubId(
        String(githubUser.id)
    );

    const existingAccount = await findGithubAccountByUserId(userId);

    if (accountWithGithubId && accountWithGithubId.userId !== userId) {
        throw new AppError("This Github account is already connected to another Flowforge user", 409);
    }

    const data = {
        userId,
        githubId: String(githubUser.id),
        username: githubUser.login,
        accessToken,
        avatarUrl: githubUser.avatar_url
    };

    if (existingAccount) {
        return updateGithubAccount(userId, data)
    }

    return createGithubAccount(data);
}

export const getGithubRepositories = async (userId) => {
    const account = await findGithubAccountByUserId(userId);

    if (!account) {
        throw new AppError(
            "Github account is not connected", 404
        );
    }

    try {
        const response = await axios.get("https://api.github.com/user/repos", {
            headers: {
                Authorization:
                    `Bearer ${account.accessToken}`,
                Accept:
                    "application/vnd.github+json"
            },
            params: {
                per_page: 100,
                sort: "updated"
            }
        })

        return response.data.map((repository) => ({
            githubRepoId: String(repository.id),
            owner:repository.owner.login,
            name:repository.name,
            fullName:repository.full_name,
            htmlUrl:repository.html_url,
            defaultBranch:repository.default_branch
        })
        );
    }catch(error){
        console.error("Github repository API error:",error.response?.data||error.message);
        throw new AppError("Failed to fetch Github repositories",400)
    }
}


//connect to one github repository

export const connectProjectRepository = async ({
    userId,
    projectId,
    organizationId,
    githubRepoId
}) => {

    /*
     * Verify that the project belongs to
     * the requested organization.
     */
    const project =
        await prisma.project.findFirst({
            where: {
                id: projectId,
                organizationId
            }
        });

    if (!project) {
        throw new AppError(
            "Project not found",
            404
        );
    }

    /*
     * Verify that this user has connected GitHub.
     */
    const account =
        await findGithubAccountByUserId(userId);

    if (!account) {
        throw new AppError(
            "GitHub account is not connected",
            404
        );
    }

    /*
     * Fetch repositories from GitHub.
     *
     * This is important because we should not blindly
     * trust a repository ID supplied by the frontend.
     */
    const repositories =
        await getGithubRepositories(userId);

    const githubRepository =
        repositories.find(
            (repository) =>
                repository.githubRepoId ===
                String(githubRepoId)
        );

    if (!githubRepository) {
        throw new AppError(
            "GitHub repository not found or not accessible",
            404
        );
    }

    /*
     * Prevent duplicate repository connection
     * for the same project.
     */
    const existingRepository =
        await prisma.projectRepository.findFirst({
            where: {
                projectId,
                githubRepoId:
                    githubRepository.githubRepoId
            }
        });

    if (existingRepository) {
        throw new AppError(
            "GitHub repository is already connected to this project",
            409
        );
    }

    return createProjectRepository({
        projectId,

        githubRepoId:
            githubRepository.githubRepoId,

        owner:
            githubRepository.owner,

        name:
            githubRepository.name,

        fullName:
            githubRepository.fullName,

        htmlUrl:
            githubRepository.htmlUrl,

        defaultBranch:
            githubRepository.defaultBranch,

        githubAccountId:
            account.id
    });
};

/*
 * Get repositories connected to FlowForge project.
 */
export const getProjectGithubRepositories = async (
    projectId,
    organizationId
) => {

    return findProjectRepositories(
        projectId,
        organizationId
    );
};

/*
 * Get one connected repository.
 */
export const getProjectGithubRepository = async (
    repositoryId,
    projectId,
    organizationId
) => {

    return findProjectRepositoryById(
        repositoryId,
        projectId,
        organizationId
    );
};

/*
 * Disconnect repository from project.
 */
export const disconnectProjectGithubRepository =
    async (
        repositoryId,
        projectId,
        organizationId
    ) => {

        const repository =
            await findProjectRepositoryById(
                repositoryId,
                projectId,
                organizationId
            );

        if (!repository) {
            return null;
        }

        const deleteResult = await deleteProjectRepository(
            repository.id,
            projectId,
            organizationId
        );

        if (deleteResult.count === 0) {
            return null;
        }

        return repository;
    };

/*
 * Disconnect user's GitHub account.
 */
export const disconnectGithubAccount = async (
    userId
) => {

    const account =
        await findGithubAccountByUserId(userId);

    if (!account) {
        throw new AppError(
            "GitHub account is not connected",
            404
        );
    }

    await deleteGithubAccount(userId);

    return {
        message:
            "GitHub account disconnected successfully"
    };
};
