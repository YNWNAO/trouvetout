import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "nahofalgbadamassi@gmail.com"; // ← TON EMAIL ADMIN

export async function POST(request) {
  try {
    const { subject, html } = await request.json();

    console.log("📧 [API] Reçu requête email");
    console.log("   Subject:", subject);
    console.log("   À envoyer à:", ADMIN_EMAIL);

    if (!subject || !html) {
      console.error("❌ [API] Données manquantes!");
      return Response.json(
        { error: "Missing subject or html" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("❌ [API] RESEND_API_KEY manquante dans .env.local");
      return Response.json(
        { error: "RESEND_API_KEY not configured" },
        { status: 500 }
      );
    }

    console.log("📤 [API] Envoi avec Resend...");

    const response = await resend.emails.send({
      from: "FastBuy 229 <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: subject,
      html: html,
    });

    console.log("✅ [API] Réponse Resend:", response);

    if (response.error) {
      console.error("❌ [API] Erreur Resend:", response.error);
      return Response.json(
        { error: "Failed to send email", details: response.error },
        { status: 500 }
      );
    }

    console.log("✅ [API] Email envoyé à l'admin! ID:", response.data?.id);
    return Response.json({ 
      success: true, 
      message: "Email sent successfully to admin",
      emailId: response.data?.id 
    });

  } catch (error) {
    console.error("❌ [API] Exception:", error);
    console.error("   Message:", error.message);
    return Response.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}