// Simple email service that works in serverless environment
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    // Only send emails if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log("Email would be sent to:", to, "Subject:", subject)
      return
    }

    // Use dynamic import for nodemailer to avoid build issues
    const nodemailer = await import("nodemailer")

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@example.com",
      to,
      subject,
      html,
    })

    console.log("Email sent successfully to:", to)
  } catch (error) {
    console.error("Failed to send email:", error)
  }
}

export const emailTemplates = {
  sellerSelected: (projectTitle: string, buyerName: string) => `
    <h2>Congratulations! You've been selected for a project</h2>
    <p>You have been selected by ${buyerName} for the project: <strong>${projectTitle}</strong></p>
    <p>Please log in to your dashboard to view project details and start working.</p>
  `,

  projectCompleted: (projectTitle: string, sellerName: string) => `
    <h2>Project Completed</h2>
    <p>The project <strong>${projectTitle}</strong> has been completed by ${sellerName}.</p>
    <p>Please review the deliverables and provide feedback.</p>
  `,
}
