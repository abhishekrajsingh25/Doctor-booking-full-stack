import Notification from "../models/notificationModel.js";
import { sendEmail } from "../services/emailService.js";

import { appointmentBookedEmail } from "../emails/appointmentBooked.js";
import { appointmentCancelledEmail } from "../emails/appointmentCancelled.js";
import { paymentSuccessEmail } from "../emails/paymentSuccess.js";

const MAX_RETRIES = 10;

const buildEmail = (notification) => {
  const { eventType, payload } = notification;

  if (eventType === "APPOINTMENT_BOOKED") {
    return appointmentBookedEmail(payload);
  }

  if (eventType === "APPOINTMENT_CANCELLED") {
    return appointmentCancelledEmail(payload);
  }

  if (eventType === "PAYMENT_SUCCESS") {
    return paymentSuccessEmail(payload);
  }

  return null;
};

export const retryFailedEmails = async () => {
  try {
    const failedNotifications = await Notification.find({
      status: "FAILED",
      retryCount: { $lt: MAX_RETRIES },
    });

    for (const notification of failedNotifications) {
      try {
        const email = buildEmail(notification);
        if (!email) continue;

        await sendEmail({
          to: notification.payload.userEmail,
          subject: email.subject,
          html: email.html,
        });

        notification.status = "SENT";
        await notification.save();

        console.log(`Retry success for notification ${notification._id}`);
      } catch (err) {
        notification.retryCount += 1;
        await notification.save();

        console.error(`Retry failed for ${notification._id}:`, err.message);
      }
    }
  } catch (error) {
    console.error("Email retry worker error:", error.message);
  }
};
