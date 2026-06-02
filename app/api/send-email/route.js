import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { subject, html } = await request.json();

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "nahofalgbadamassi@gmail.com",
      subject: subject,
      html: html,
    });

    if (response.error) {
      return Response.json({ error: response.error }, { status: 500 });
    }

    return Response.json({ success: true, id: response.data.id });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}