import amqp from "amqplib";

let channel;

export const initRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();

  // Dead Letter Exchange
  await channel.assertExchange("notification.dlx", "direct", {
    durable: true,
  });

  // Main queue (MUST MATCH BACKEND)
  await channel.assertQueue("notification.events", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "notification.dlx",
      "x-dead-letter-routing-key": "notification.events.dlq",
    },
  });

  // Dead Letter Queue
  await channel.assertQueue("notification.events.dlq", {
    durable: true,
  });

  await channel.bindQueue(
    "notification.events.dlq",
    "notification.dlx",
    "notification.events.dlq"
  );

  // Retry queue with TTL (30s)
  await channel.assertQueue("notification.retry.queue", {
    durable: true,
    arguments: {
      "x-message-ttl": 30000,
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": "notification.events",
    },
  });

  console.log("RabbitMQ connected (Notification Service)");
};

export const getChannel = () => channel;
