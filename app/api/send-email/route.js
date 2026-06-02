export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    console.log("📧 Envoi email à:", to, "Sujet:", subject);

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

    const data = await response.json();
    console.log("✅ Réponse EmailJS:", data);

    if (!response.ok) {
      console.error("❌ Erreur EmailJS:", data);
      return Response.json({ error: data }, { status: 400 });
    }

    console.log("✅ Email envoyé avec succès!");
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("❌ Exception:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}