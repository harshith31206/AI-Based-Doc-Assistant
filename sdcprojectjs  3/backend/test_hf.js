const { HfInference } = require("@huggingface/inference");
require('dotenv').config();

async function testHF() {
    console.log("Testing Hugging Face API (Chat)...");
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

    try {
        console.log("Attempting chatCompletion with google/gemma-2-2b-it...");
        const response = await hf.chatCompletion({
            model: "google/gemma-2-2b-it",
            messages: [
                { role: "user", content: "Hello, explain AI in one sentence." }
            ],
            max_tokens: 100
        });
        console.log("Success!");
        console.log(response.choices[0].message.content);
    } catch (err) {
        console.error("Error details:", err);
    }
}

testHF();
