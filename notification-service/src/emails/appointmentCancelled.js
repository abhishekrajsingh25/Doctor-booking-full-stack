export const appointmentCancelledEmail = ({
    userName,
    doctorName,
    slotDate,
    slotTime,
    cancelledBy,
  }) => ({
    subject: "Appointment Cancelled",
    html: `
      <h2>Appointment Cancelled ❌</h2>
      <p>Hello <b>${userName}</b>,</p>
      <p>Your appointment with <b>Dr. ${doctorName}</b> has been cancelled.</p>
      <p>
        <b>Date:</b> ${slotDate}<br/>
        <b>Time:</b> ${slotTime}
      </p>
      <p><b>Cancelled by:</b> ${cancelledBy}</p>
      <p>— Prescripto</p>
    `,
  });
  