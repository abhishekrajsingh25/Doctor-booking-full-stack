export const paymentSuccessEmail = ({
  userName,
  doctorName,
  slotDate,
  slotTime,
  amount,
}) => ({
  subject: "Payment Successful",
  html: `
      <h2>Payment Successful 💳</h2>
  
      <p>Hello <b>${userName}</b>,</p>
  
      <p>Your payment for the appointment with <b>Dr. ${doctorName}</b> was successful.</p>
  
      <p>
        <b>Date:</b> ${slotDate}<br/>
        <b>Time:</b> ${slotTime}<br/>
        <b>Amount Paid:</b> ₹${amount}
      </p>
  
      <p>Thank you for using Prescripto.</p>
    `,
});
