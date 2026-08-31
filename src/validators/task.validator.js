import { z } from "zod";

export const createTaskSchema = z.object({
    title: z
        .string()
        .min(2)
        .max(200),

    completed: z
        .boolean()
        .optional()
});

export const updateTaskSchema = z.object({
    title: z
        .string()
        .min(2)
        .max(200)
        .optional(),

    completed: z
        .boolean()
        .optional()
});