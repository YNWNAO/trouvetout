import { Resend } from "resend";

export async function POST(request) {
  console.log("🔴 [ROUTE] Reçu une requête");
  console.log("API Key présente?", !!process.env.RESEND_API_KEY);
  
  try {
    const { subject, html } = await request.json();
    console.log("📧 Subject:", subject);

    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY MANQUANTE!");
      return Response.json({ error: "API Key missing" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "nahofalgbadamassi@gmail.com",
      subject: subject,
      html: html,
    });

    console.log("✅ Résponse Resend:", response);

    if (response.error) {
      console.error("❌ Erreur Resend:", response.error);
      return Response.json({ error: response.error }, { status: 500 });
    }

    console.log("✅ EMAIL ENVOYÉ!");
    return Response.json({ success: true });

  } catch (error) {
    console.error("❌ EXCEPTION:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}