const amqp = require('amqplib');

let channel;

async function connectQueue() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);

  channel = await connection.createChannel();

  await channel.assertQueue('chat-messages');
}

async function publishMessage(data) {
  channel.sendToQueue(
    'chat-messages',
    Buffer.from(JSON.stringify(data))
  );
}

module.exports = {
  connectQueue,
  publishMessage
};