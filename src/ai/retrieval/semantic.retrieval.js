//RAG engine

import prisma from "../../lib/prisma.js";
import { generateEmbedding,cosineSimilarity } from "../embeddings/embedding.service";
import logger from "../../config/logger.js";

