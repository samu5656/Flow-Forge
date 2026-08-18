import { z } from "zod";

export const createOrganizationSchema = z.object({
    name: z
        .string()
        .min(2)
        .max(100),

    slug: z
        .string()
        .min(2)
        .max(100)
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain only lowercase letters,numbers and hyphens"
        ),
    description: z
        .string()
        .max(500)
        .optional()
})

export const updateOrganizationSchema = z.object({
    name: z
        .string()
        .min(2)
        .max(100)
        .optional(),

    slug: z
        .string()
        .min(2)
        .max(100)
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must contain only lowercase letters,numbers and hyphens"
        )
        .optional(),

    description: z
        .string()
        .max(500)
        .optional()
})