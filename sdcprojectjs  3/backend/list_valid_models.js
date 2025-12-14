const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Found models:", data.models.length);
            const genModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
            genModels.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.log("No models found or error:", JSON.stringify(data));
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
