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

    const transporter = nodemailer.createTransport({
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">🎉 Congratulations! You've been selected for a project</h2>
      <p>You have been selected by <strong>${buyerName}</strong> for the project:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin: 0; color: #1f2937;">${projectTitle}</h3>
      </div>
      <p>Please log in to your dashboard to view project details and start working.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://seller-buyer-bidding-system-eta.vercel.app"}/dashboard" 
         style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        View Dashboard
      </a>
    </div>
  `,

  projectCompleted: (projectTitle: string, sellerName: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">✅ Project Completed</h2>
      <p>The project <strong>${projectTitle}</strong> has been completed by <strong>${sellerName}</strong>.</p>
      <p>Please review the deliverables and provide feedback.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://seller-buyer-bidding-system-eta.vercel.app"}/dashboard" 
         style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Review Project
      </a>
    </div>
  `,

  newBid: (projectTitle: string, bidderName: string, bidAmount: number) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">💰 New Bid Received</h2>
      <p>You have received a new bid for your project:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="margin: 0; color: #1f2937;">${projectTitle}</h3>
        <p style="margin: 8px 0 0 0;"><strong>Bidder:</strong> ${bidderName}</p>
        <p style="margin: 8px 0 0 0;"><strong>Bid Amount:</strong> $${bidAmount.toLocaleString()}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://seller-buyer-bidding-system-eta.vercel.app"}/dashboard" 
         style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        View All Bids
      </a>
    </div>
  `,
}
