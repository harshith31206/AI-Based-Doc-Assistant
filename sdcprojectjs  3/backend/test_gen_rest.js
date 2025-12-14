const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGenerate() {
    const key = process.env.GEMINI_API_KEY;
    const modelName = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${key}`;

    const body = {
        contents: [{
            parts: [{ text: "Hello, explain how AI works in one sentence." }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.log("Status:", response.status);
            console.log("StatusText:", response.statusText);
            const errorText = await response.text();
            console.log("Error Body:", errorText);
        } else {
            const data = await response.json();
            console.log("Success!");
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

testGenerate();
