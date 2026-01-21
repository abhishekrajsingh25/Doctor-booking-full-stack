import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { startAuditConsumer } from "./kafkaConsumer.js";
import { register } from "./metrics.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// start Kafka consumer
startAuditConsumer();

// health check
app.get("/", (req, res) => {
  res.send("Audit Service Running");
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Audit Service running on port ${PORT}`);
});
