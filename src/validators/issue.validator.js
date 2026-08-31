import {z} from "zod";

export const createIssueSchema = z.object({
    title:z
    .string()
    .min(2)
    .max(200),

    description: z
    .string()
    .max(5000)
    .optional(),


    priority: z
    .enum([
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL"
    ])
    .optional()
})