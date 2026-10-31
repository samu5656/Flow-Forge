import { geminiModel } from "../config/ai.config.js";
import { getProjectContext } from "../ai/retrieval/context.retrieval.js";
import { buildSystemPrompt } from "../ai/prompts/system.prompt.js";

export const chatWithProjectAIService = async ({ message, history = [], projectId, organizationId }) => {
    const projectContext = await getProjectContext(projectId, organizationId);
    const systemPrompt = buildSystemPrompt(projectContext);

    //previous convo history
    // Gemini expects: [ { role: 'user'|'model', parts: [{ text: '...' }] } ]
    const formattedHistory = history.map(item => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }]
    }));

    const chat = geminiModel.startChat({
        history: [
            //systemprompt
            {
                role: "user",
                parts: [{ text: systemPrompt }]
            },
            {
                role: "model",
                parts: [{ text: "Understood.I am FlowForge AI, and I am ready to answer questions based strictly on this project's records." }]
            },
            ...formattedHistory
        ]
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const replyText = response.text();

    return {
        reply: replyText,
        // Return updated history so frontend can easily send it on the next turn
        history: [
            ...history,
            { role: "user", content: message },
            { role: "assistant", content: replyText }
        ]
    };

}
