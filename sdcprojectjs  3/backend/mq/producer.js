const { getChannel, QUEUE_NAME } = require('./connection');

async function publishToQueue(payload) {
    const client = await getChannel();

    // Simple JSON payload for our Node.js worker
    // No need for Celery protocol anymore
    const message = JSON.stringify(payload);

    // RPUSH to add to the end of the list
    await client.rPush(QUEUE_NAME, message);
    console.log(`[Producer] Message sent to Redis queue: ${QUEUE_NAME}`);
}

module.exports = { publishToQueue };
