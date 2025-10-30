// FIX: Refactored to remove React components from a .ts file, resolving numerous JSX parsing errors.
// This file now only contains data-fetching logic and type definitions, aligning with its role as a service.
import { GoogleGenAI } from "@google/genai";

// Interfaces for typing API response for grounding
export interface WebChunk {
    uri: string;
    title: string;
}

export interface GroundingChunk {
    web?: WebChunk;
}

export interface NewsData {
    news: string;
    sources: GroundingChunk[];
}

export const fetchNews = async (): Promise<NewsData> => {
    // Per guidelines, assume API_KEY is available.
    if (!process.env.API_KEY) {
        console.error("API key is not configured.");
        throw new Error("Configuration error. Unable to fetch news.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "What are the latest news and updates from the Gujarat education board?",
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    const newsText = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (!newsText) {
        return { news: '', sources: [] };
    }

    return {
        news: newsText,
        sources: (groundingChunks as GroundingChunk[]) || [],
    };
};