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

export const getProjectDocuments = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const docs = await prisma.projectDocument.findMany({
            where: { projectId },
            select: {
                id: true,
                title: true,
                category: true,
                content: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json({
            success: true,
            data: docs
        });
    } catch (err) {
        next(err);
    }
};

export const deleteProjectDocument = async (req, res, next) => {
    try {
        const { projectId, documentId } = req.params;
        await prisma.projectDocument.deleteMany({
            where: {
                id: documentId,
                projectId
            }
        });

        res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};
