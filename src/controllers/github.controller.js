import {
    createGithubOAuthState,
    validateGithubOAuthState,
    getGithubAuthorizationUrl,
    connectGithubAccount,
    getGithubRepositories,
    connectProjectRepository,
    getProjectGithubRepositories,
    getProjectGithubRepository,
    disconnectProjectGithubRepository,
    disconnectGithubAccount
} from "../services/github.service.js";

/*
 * Start GitHub OAuth.
 */
export const connectGithub = async (
    req,
    res,
    next
) => {

    try {

        const userId = req.user.id;

        const state =
            createGithubOAuthState(userId);

        const url =
            getGithubAuthorizationUrl(state);

        res.status(200).json({
            success: true,
            data: {
                url
            }
        });

    } catch (error) {
        next(error);
    }
};

/*
 * GitHub OAuth callback.
 *
 * The normal JWT Authorization header will not
 * be available after GitHub redirects the browser.
 *
 * Therefore we recover the user through OAuth state.
 */
export const githubCallback = async (
    req,
    res,
    next
) => {

    try {

        const {
            code,
            state
        } = req.query;

        if (!code) {
            return res.status(400).json({
                success: false,
                message:
                    "GitHub authorization code is required"
            });
        }

        if (!state) {
            return res.status(400).json({
                success: false,
                message:
                    "OAuth state is required"
            });
        }

        const userId =
            validateGithubOAuthState(state);

        const account =
            await connectGithubAccount(
                userId,
                code
            );

        res.status(200).json({
            success: true,
            message:
                "GitHub account connected successfully",

            data: {
                githubId:
                    account.githubId,

                username:
                    account.username,

                avatarUrl:
                    account.avatarUrl
            }
        });

    } catch (error) {
        next(error);
    }
};

/*
 * Get user's GitHub repositories.
 */
export const getGithubRepos = async (
    req,
    res,
    next
) => {

    try {

        const repositories =
            await getGithubRepositories(
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: repositories
        });

    } catch (error) {
        next(error);
    }
};

/*
 * Connect GitHub repository to project.
 */
export const connectRepositoryToProject =
    async (
        req,
        res,
        next
    ) => {

        try {

            const repository =
                await connectProjectRepository({
                    userId:
                        req.user.id,

                    organizationId:
                        req.params.organizationId,

                    projectId:
                        req.params.projectId,

                    githubRepoId:
                        req.body.githubRepoId
                });

            res.status(201).json({
                success: true,
                data: repository
            });

        } catch (error) {
            next(error);
        }
    };

/*
 * Get repositories connected to project.
 */
export const getProjectRepositories =
    async (
        req,
        res,
        next
    ) => {

        try {

            const repositories =
                await getProjectGithubRepositories(
                    req.params.projectId,
                    req.params.organizationId
                );

            res.status(200).json({
                success: true,
                data: repositories
            });

        } catch (error) {
            next(error);
        }
    };

/*
 * Get one repository connected to project.
 */
export const getProjectRepository =
    async (
        req,
        res,
        next
    ) => {

        try {

            const repository =
                await getProjectGithubRepository(
                    req.params.repositoryId,
                    req.params.projectId,
                    req.params.organizationId
                );

            if (!repository) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Repository connection not found"
                });
            }

            res.status(200).json({
                success: true,
                data: repository
            });

        } catch (error) {
            next(error);
        }
    };

/*
 * Disconnect repository from project.
 */
export const disconnectRepository =
    async (
        req,
        res,
        next
    ) => {

        try {

            const repository =
                await disconnectProjectGithubRepository(
                    req.params.repositoryId,
                    req.params.projectId,
                    req.params.organizationId
                );

            if (!repository) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Repository connection not found"
                });
            }

            res.status(200).json({
                success: true,
                message:
                    "GitHub repository disconnected successfully"
            });

        } catch (error) {
            next(error);
        }
    };

/*
 * Disconnect GitHub account.
 */
export const disconnectGithub =
    async (
        req,
        res,
        next
    ) => {

        try {

            const result =
                await disconnectGithubAccount(
                    req.user.id
                );

            res.status(200).json({
                success: true,
                ...result
            });

        } catch (error) {
            next(error);
        }
    };