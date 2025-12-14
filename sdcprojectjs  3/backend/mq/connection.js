const { createClient } = require('redis');

let client = null;

const QUEUE_NAME = 'file_processing_queue';

async function getChannel() {
    if (client) return client;

    try {
        client = createClient({
            url: 'redis://localhost:6379'
        });

        client.on('error', (err) => console.log('Redis Client Error', err));

        await client.connect();
        console.log('Connected to Redis');
        return client;
    } catch (err) {
        console.error('Failed to connect to Redis:', err.message);
        throw err;
    }
}

module.exports = { getChannel, QUEUE_NAME };
