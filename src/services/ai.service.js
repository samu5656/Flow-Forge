import { getProjectContext } from "../ai/retrieval/context.retrieval.js";
import { buildSystemPrompt } from "../ai/prompts/system.prompt.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { projectAITools } from "../ai/tools/definitions.js";
import { executeTool } from "../ai/tools/executors.js";
import { findRelevantDocuments } from "../ai/retrieval/semantic.retrieval.js";

const CANDIDATE_MODELS = [
    process.env.GEMINI_MODEL,
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-pro"
].filter(Boolean);

export const chatWithProjectAIService = async ({ message, history = [], projectId, organizationId }) => {
    // 1. Fetch live database context
    const projectContext = await getProjectContext(projectId, organizationId);
    const relevantDocs = await findRelevantDocuments(message, projectId, 2);

    let docContext = "";
    if (relevantDocs.length > 0) {
        docContext = "\n RELEVANT ARCHITECTURE & KNOWLEDGE BASE DOCS \n";
        relevantDocs.forEach((doc, idx) => {
            docContext += `[Doc ${idx + 1}:${doc.title}(${doc.category})]\n${doc.content}\n\n`;
        });
    }
    const systemPrompt = buildSystemPrompt(projectContext + docContext);

    // 2. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    // 3. Format previous conversation history
    const formattedHistory = history.map(item => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }]
    }));

    let lastError = null;
    let response = null;

    // Try candidate models in order until one succeeds
    for (const modelName of CANDIDATE_MODELS) {
        try {
            const modelWithTools = genAI.getGenerativeModel({
                model: modelName,
                tools: projectAITools,
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 1000
                }
            });

            const chat = modelWithTools.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }]
                    },
                    {
                        role: "model",
                        parts: [{ text: "Understood. I am FlowForge AI, ready to assist and manage project records with available tools." }]
                    },
                    ...formattedHistory
                ]
            });

            let result = await chat.sendMessage(message);
            response = await result.response;

            const functionCalls = response.functionCalls();

            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                const toolName = call.name;
                const toolArgs = call.args;

                // Execute the tool in our backend
                const toolResult = await executeTool(toolName, toolArgs, { projectId, organizationId });

                // Feed the execution result back to Gemini so it summarizes the action for the user
                result = await chat.sendMessage([
                    {
                        text: `[System Observation]: Tool '${toolName}' executed with result: ${JSON.stringify(toolResult)}. Formulate a clear confirmation message for the user.`
                    }
                ]);
                response = await result.response;
            }

            lastError = null;
            break; // Success!
        } catch (err) {
            console.warn(`[AI Service] Model '${modelName}' failed (${err.message}). Trying next fallback...`);
            lastError = err;
        }
    }

    if (lastError || !response) {
        throw lastError || new Error("Failed to receive response from Gemini models.");
    }

    const replyText = response.text();

    return {
        reply: replyText,
        history: [
            ...history,
            { role: "user", content: message },
            { role: "assistant", content: replyText }
        ]
    };
};
