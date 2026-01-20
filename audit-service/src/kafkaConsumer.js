import { Kafka } from "kafkajs";
import sql from "./config/postgres.js";

const kafka = new Kafka({
  clientId: "audit-service",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "audit-group" });

export const startAuditConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "audit.events",
    fromBeginning: true,
  });

  console.log("Kafka connected (Audit Service)");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      await sql`
        INSERT INTO audit_logs (
          event_type,
          entity_id,
          user_id,
          doctor_id,
          payload
        ) VALUES (
          ${event.eventType},
          ${event.entityId},
          ${event.userId},
          ${event.doctorId},
          ${event.payload}
        )
      `;
    },
  });
};
