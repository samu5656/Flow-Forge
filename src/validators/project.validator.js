export const createProjectSchema = z.object({
    name: z
        .string()
        .min(2)
        .max(100),

    slug: z
        .string()
        .min(2)
        .max(100)
        .regex(
            /^[a-z0-9-]+$/,
            "Slug must contain lowercase letters, numbers and hyphens"
        ),

    description: z
        .string()
        .max(1000)
        .optional()
});

export const updateProjectSchema = z.object({
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
            /^[a-z0-9-]+$/,
            "Slug must contain lowercase letters, numbers and hyphens"
        )
        .optional(),

    description: z
        .string()
        .max(1000)
        .optional()
});