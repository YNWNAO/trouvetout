export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": "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",
      },
      body: JSON.stringify({
        sender: { name: "FastBuy 229", email: "nahofalgbadamassi@gmail.com" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return Response.json({ error }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}