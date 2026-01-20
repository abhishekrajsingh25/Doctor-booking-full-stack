import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";

import { initRabbitMQ } from "./messaging/rabbitmq.js";
import { startNotificationConsumer } from "./messaging/consumer.js";
import { startDLQRetryWorker } from "./workers/dlqRetryWorker.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Notification Service Running");
});

const start = async () => {
  await connectDB();
  await initRabbitMQ();
  await startNotificationConsumer();
  await startDLQRetryWorker();
};

start();

app.listen(5001, () => {
  console.log("Notification Service running on port 5001");
});
