import { z } from "zod";

export const createMilestoneSchema = z.object({
    title: z
        .string()
        .min(2)
        .max(200),

    description: z
        .string()
        .max(2000)
        .optional(),

    dueDate: z
        .coerce
        .date()
        .optional()
});

export const updateMilestoneSchema = z.object({
    title: z
        .string()
        .min(2)
        .max(200)
        .optional(),

    description: z
        .string()
        .max(2000)
        .optional(),

    dueDate: z
        .coerce
        .date()
        .nullable()
        .optional()
});