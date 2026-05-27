import { Resend } from 'resend';

const resend = new Resend('re_6ewZNDkg_9iGTP3AwCrcpXGPmho32keLN');

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();
    
    const { data, error } = await resend.emails.send({
      from: 'TrouveTout <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) return Response.json({ error }, { status: 400 });
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}