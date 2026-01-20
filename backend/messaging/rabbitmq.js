import amqp from "amqplib";

let channel;

export const initRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();

  // Dead Letter Exchange
  await channel.assertExchange("notification.dlx", "direct", {
    durable: true,
  });

  // Main Queue with DLQ attached
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

  // Bind DLQ to DLX
  await channel.bindQueue(
    "notification.events.dlq",
    "notification.dlx",
    "notification.events.dlq"
  );

  console.log("RabbitMQ connected (Backend)");
};

export const publishNotificationEvent = async (event) => {
  channel.sendToQueue(
    "notification.events",
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );
};
