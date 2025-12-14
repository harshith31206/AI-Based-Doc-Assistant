const { HfInference } = require("@huggingface/inference");
require('dotenv').config();

async function testLongContext() {
    console.log("Testing text generation with LONG context...");
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

    // Create a dummy text of ~5000 characters
    const longText = "This is a sentence. ".repeat(250);

    console.log(`Input length: ${longText.length} characters.`);

    try {
        console.log("Attempting chatCompletion with google/gemma-2-2b-it...");
        const response = await hf.chatCompletion({
            model: "google/gemma-2-2b-it",
            messages: [
                { role: "system", content: "You are a helpful assistant. Context: " + longText },
                { role: "user", content: "Summarize the context." }
            ],
            max_tokens: 100
        });
        console.log("Success with Gemma!");
        console.log(response.choices[0].message.content);
    } catch (err) {
        console.error("Gemma Failed:", err.message);
    }

    try {
        console.log("\nAttempting chatCompletion with microsoft/Phi-3-mini-4k-instruct...");
        const response = await hf.chatCompletion({
            model: "microsoft/Phi-3-mini-4k-instruct",
            messages: [
                { role: "system", content: "You are a helpful assistant. Context: " + longText },
                { role: "user", content: "Summarize the context." }
            ],
            max_tokens: 100
        });
        console.log("Success with Phi-3!");
        console.log(response.choices[0].message.content);
    } catch (err) {
        console.error("Phi-3 Failed:", err.message);
    }
}

testLongContext();
