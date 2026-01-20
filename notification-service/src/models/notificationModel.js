import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  entityId: String,
  userId: String,
  doctorId: String,
  payload: Object,
  status: {
    type: String,
    enum: ["RECEIVED", "SENT", "FAILED"],
    default: "RECEIVED",
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
});

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
