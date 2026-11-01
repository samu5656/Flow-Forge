import { getProjectContext } from "../ai/retrieval/context.retrieval.js";
import { buildSystemPrompt } from "../ai/prompts/system.prompt.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { projectAITools } from "../ai/tools/definitions.js";
import { executeTool } from "../ai/tools/executors.js";

export const chatWithProjectAIService = async ({ message, history = [], projectId, organizationId }) => {
    // 1. Fetch live database context
    const projectContext = await getProjectContext(projectId, organizationId);
    const systemPrompt = buildSystemPrompt(projectContext);

    // 2. Initialize Gemini with tools declared
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const modelWithTools = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
        tools: projectAITools,
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000
        }
    });

    // 3. Format previous conversation history
    const formattedHistory = history.map(item => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }]
    }));

    // 4. Start chat session
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
    let response = await result.response;

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
