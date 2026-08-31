import { z } from "zod";

export const createIssueSchema = z.object({
    title: z
        .string()
        .min(2)
        .max(200),

    description: z
        .string()
        .max(5000)
        .optional(),

    status: z
        .enum([
            "OPEN",
            "IN_PROGRESS",
            "RESOLVED",
            "CLOSED"
        ])
        .optional(),

    priority: z
        .enum([
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL"
        ])
        .optional()
});

export const updateIssueSchema = z.object({
    title: z
        .string()
        .min(2)
        .max(200)
        .optional(),

    description: z
        .string()
        .max(5000)
        .optional(),

    status: z
        .enum([
            "OPEN",
            "IN_PROGRESS",
            "RESOLVED",
            "CLOSED"
        ])
        .optional(),

    priority: z
        .enum([
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL"
        ])
        .optional()
});