import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sql from "./config/postgres.js";
import { startAuditConsumer } from "./kafkaConsumer.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

startAuditConsumer();

app.get("/", (req, res) => {
  res.send("Audit Service Running");
});

// app.post("/events", async (req, res) => {
//   try {
//     const { eventType, entityId, userId, doctorId, payload } = req.body;

//     if (!eventType) {
//       return res.status(400).json({ success: false });
//     }

//     await sql`
//       INSERT INTO audit_logs (
//         event_type,
//         entity_id,
//         user_id,
//         doctor_id,
//         payload
//       ) VALUES (
//         ${eventType},
//         ${entityId},
//         ${userId},
//         ${doctorId},
//         ${payload}
//       )
//     `;

//     res.json({ success: true });
//   } catch (error) {
//     console.error("Audit error:", error.message);
//     res.status(500).json({ success: false });
//   }
// });

app.listen(PORT, () => {
  console.log(`Audit Service running on port ${PORT}`);
});
