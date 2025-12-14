const { createClient } = require('redis');
const connectDB = require('../db');
const Document = require('../models/Document');
const pdfParse = require('pdf-parse');
const officeParser = require('officeparser');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const QUEUE_NAME = 'file_processing_queue';

async function processTask(taskData) {
    const { fileId, filePath, userId } = taskData;
    console.log(`[Worker] Processing file: ${fileId}`);

    try {
        // Update status to processing
        await Document.findByIdAndUpdate(fileId, { status: 'processing' });

        const ext = path.extname(filePath).toLowerCase();
        let extractedText = "";

        if (ext === '.pdf') {
            console.log(`[Worker] Extracting PDF: ${filePath}`);
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
        } else if (['.docx', '.pptx', '.doc', '.ppt'].includes(ext)) {
            console.log(`[Worker] Extracting Office Doc: ${filePath}`);
            // officeparser.parsePromise returns the text
            extractedText = await officeParser.parsePromise(filePath);
        } else {
            throw new Error(`Unsupported file extension: ${ext}`);
        }

        console.log(`[Worker] Extraction complete. Length: ${extractedText.length}`);

        // Update success
        await Document.findByIdAndUpdate(fileId, {
            extractedText: extractedText,
            status: 'completed'
        });
        console.log(`[Worker] Successfully processed: ${fileId}`);

    } catch (err) {
        console.error(`[Worker] Failed to process ${fileId}:`, err);
        await Document.findByIdAndUpdate(fileId, {
            status: 'failed',
            error: err.message
        });
    }
}

async function startWorker() {
    await connectDB();

    const client = createClient({
        url: 'redis://localhost:6379'
    });

    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();

    console.log('[Worker] Connected to Redis and MongoDB. Waiting for tasks...');

    while (true) {
        try {
            // BLPOP blocks until a message is available
            // returns { key: 'queue_name', element: 'message_value' }
            const result = await client.blPop(QUEUE_NAME, 0);

            if (result && result.element) {
                const taskString = result.element;
                const taskData = JSON.parse(taskString);
                await processTask(taskData);
            }
        } catch (err) {
            console.error('[Worker] Error in loop:', err);
            // Wait a bit before retrying loop to avoid tight loop on persistent error
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

startWorker();
