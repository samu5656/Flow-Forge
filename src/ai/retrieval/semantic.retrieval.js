import prisma from "../../lib/prisma.js";
import { generateEmbedding, cosineSimilarity } from "../embeddings/embedding.service.js";
import logger from "../../config/logger.js";

/**
 * Finds the top N most relevant document chunks for a user question using cosine similarity.
 */
export const findRelevantDocuments = async (query, projectId, topK = 3) => {
    try {
        // 1. Fetch all documents for this project that have embeddings
        const docs = await prisma.projectDocument.findMany({
            where: { projectId, embedding: { not: null } },
            select: { id: true, title: true, content: true, embedding: true, category: true }
        });

        if (docs.length === 0) return [];

        // 2. Convert user question into an embedding vector
        const queryEmbedding = await generateEmbedding(query);

        // 3. Compute cosine similarity for each document
        const scoredDocs = docs.map(doc => {
            const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
            return {
                title: doc.title,
                category: doc.category,
                content: doc.content,
                score: similarity
            };
        });

        // 4. Sort descending by similarity score
        scoredDocs.sort((a, b) => b.score - a.score);

        // Filter by threshold and take top K
        const relevantDocs = scoredDocs.filter(d => d.score > 0.45).slice(0, topK);

        logger.info(`🔍 RAG retrieved ${relevantDocs.length} relevant docs for query: "${query}"`);
        return relevantDocs;
    } catch (err) {
        logger.error(`RAG retrieval error: ${err.message}`);
        return [];
    }
};
