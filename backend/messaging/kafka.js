import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "prescripto-backend",
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();

export const initKafka = async () => {
  await producer.connect();
  console.log("Kafka connected (Backend)");
};

export const publishAuditEvent = async (event) => {
  await producer.send({
    topic: "audit.events",
    messages: [
      {
        value: JSON.stringify(event),
      },
    ],
  });
};
