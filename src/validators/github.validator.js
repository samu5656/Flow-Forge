import {z} from "zod";

export const connectGithubRepositorySchema =
            z.object({
                githubRepoId: z
                .string()
                .min(1,"GitHub repository ID is required")
            })