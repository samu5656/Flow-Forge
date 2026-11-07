import prisma from "../lib/prisma.js";
import { generateEmbedding } from "../ai/embeddings/embedding.service.js";

export const createProjectDocument = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { title, content, category } = req.body;

        // Automatically generate semantic embedding
        const embedding = await generateEmbedding(`${title}\n${content}`);

        const doc = await prisma.projectDocument.create({
            data: {
                title,
                content,
                category: category || "GENERAL",
                projectId,
                embedding
            }
        });

        res.status(201).json({
            success: true,
            message: "Document ingested and embedded successfully!",
            data: { id: doc.id, title: doc.title }
        });
    } catch (err) {
        next(err);
    }
};
