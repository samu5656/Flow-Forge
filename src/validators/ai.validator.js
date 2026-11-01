import { z } from "zod";

export const chatSchema = z.object({
    message: z.string({
        required_error: "Message is required"
    }).min(1, "Message cannot be empty").max(2000, "Message cannot exceed 2000 characters"),

    history: z.array(
        z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string().min(1)
        })
    ).optional().default([])
});
