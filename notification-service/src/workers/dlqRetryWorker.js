import { getChannel } from "../messaging/rabbitmq.js";

const MAX_RETRIES = 5;

export const startDLQRetryWorker = async () => {
  const channel = getChannel();

  await channel.consume("notification.events.dlq", async (msg) => {
    if (!msg) return;

    const event = JSON.parse(msg.content.toString());
    const currentRetry =
      (msg.properties.headers?.["x-retry-count"] || 0) + 1;

    if (currentRetry > MAX_RETRIES) {
      console.error("Max retries reached, giving up");
      channel.ack(msg);
      return;
    }

    console.log(
      `Scheduling retry ${currentRetry} after delay`
    );

    // ⏳ ONLY schedule retry (no email sending here)
    channel.sendToQueue(
      "notification.retry.queue",
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        headers: {
          "x-retry-count": currentRetry,
        },
      }
    );

    channel.ack(msg);
  });

  console.log("DLQ Retry Worker started");
};
