export const appointmentBookedEmail = ({
    userName,
    doctorName,
    slotDate,
    slotTime,
  }) => ({
    subject: "Appointment Confirmed",
    html: `
      <h2>Appointment Confirmed ✅</h2>
      <p>Hello <b>${userName}</b>,</p>
      <p>Your appointment with <b>Dr. ${doctorName}</b> is confirmed.</p>
      <p>
        <b>Date:</b> ${slotDate}<br/>
        <b>Time:</b> ${slotTime}
      </p>
      <p>Thank you,<br/>Prescripto</p>
    `,
  });
  