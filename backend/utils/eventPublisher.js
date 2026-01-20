import { publishNotificationEvent } from "../messaging/rabbitmq.js";
import { publishAuditEvent } from "../messaging/kafka.js";

export const publishEvent = async (eventType, data) => {
  const event = { eventType, ...data };

  // RabbitMQ → Notification
  await publishNotificationEvent(event);

  // Kafka → Audit
  await publishAuditEvent(event);
};
