const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const list = await genAI.getGenerativeModelFactory().listModels(); // This might be wrong API usage for v0.24.1?
        // Let's try to find the correct way for v0.24.1 or just try a standard method if I'm unsure, but checking docs mentally...
        // simpler approach:
        // actually, in 0.24.1 it might be different. Let's try to just fetch it or inspect the GoogleGenerativeAI object if possible.
        // Wait, the SDK doesn't expose listModels directly on the main class instance easily in all versions.
        // Let's try the keyless HTTP approach if SDK fails, but SDK is better.
        // Actually, checking standard pattern:
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels on genAI instance usually.
        // It's usually a separate call relative to the API.

        // Let's try a raw fetch to the API endpoint since I have the key.
        const key = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (Supports generateContent)`);
                } else {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("Error or no models found:", JSON.stringify(data, null, 2));
        }

    } catch (err) {
        console.error("Error listing models:", err);
    }
}

listModels();
