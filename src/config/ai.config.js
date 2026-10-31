import {GoogleGenerativeAI} from "@google/generative-ai";

if(!process.env.GEMINI_API_KEY){
    console.warn("Gemini API key not defined");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    export const geminiModel = genAI.getGenerativeModel({
        model:"gemini-1.5-flash",
        generationConfig:{
            temperature: 0.2, //factual,deterministic
            maxOutputTokens : 1000,
        }
    })