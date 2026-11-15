
import { Resend } from "resend";

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is not configured.");
  }

  if (!to) {
    throw new Error("Email recipient is required.");
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    html,
    replyTo:
      process.env.RESEND_REPLY_TO ||
      "tassistant@trevoslimited.com",
  });

  if (error) {
    console.error("Resend email delivery error:", error);

    throw new Error(
      `Resend email delivery failed: ${error.message}`
    );
  }

  console.log("Email successfully accepted by Resend:", {
    id: data?.id,
    recipient: to,
    subject,
  });

  return data;
}
