export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: "service_7cfdoej",
        template_id: "qi0vriw",
        user_id: "oyw_7DuNRrV7R4MXT",
        template_params: {
          to_email: to,
          subject: subject,
          message: html,
          name: "FastBuy 229",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}