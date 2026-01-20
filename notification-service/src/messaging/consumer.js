import Notification from "../models/notificationModel.js";
import { sendEmail } from "../services/emailService.js";
import { getChannel } from "./rabbitmq.js";

import { appointmentBookedEmail } from "../emails/appointmentBooked.js";
import { appointmentCancelledEmail } from "../emails/appointmentCancelled.js";
import { paymentSuccessEmail } from "../emails/paymentSuccess.js";

export const startNotificationConsumer = async () => {
  const channel = getChannel();

  await channel.consume("notification.events", async (msg) => {
    if (!msg) return;

    const event = JSON.parse(msg.content.toString());
    const notification = await Notification.create(event);

    try {
      let email;

      if (event.eventType === "APPOINTMENT_BOOKED")
        email = appointmentBookedEmail(event.payload);

      if (event.eventType === "APPOINTMENT_CANCELLED")
        email = appointmentCancelledEmail(event.payload);

      if (event.eventType === "PAYMENT_SUCCESS")
        email = paymentSuccessEmail(event.payload);

      if (email) {
        await sendEmail({
          to: event.payload.userEmail,
          subject: email.subject,
          html: email.html,
        });
      }

      notification.status = "SENT";
      await notification.save();

      channel.ack(msg);
    } catch (err) {
      notification.status = "FAILED";
      await notification.save();

      // Send to DLQ
      channel.nack(msg, false, false);
    }
  });
};
