"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const CATEGORIES = [
  { icon: "🌸", name: "Parfums" },
  { icon: "👗", name: "Vêtements" },
  { icon: "👟", name: "Chaussures" },
  { icon: "📱", name: "Téléphones" },
  { icon: "🪢", name: "Ceintures" },
  { icon: "👜", name: "Sacs" },
  { icon: "💍", name: "Bijoux" },
  { icon: "💻", name: "Ordinateurs" },
];

const STATUTS = ["Commande reçue", "En préparation", "En livraison", "Livré"];
const PLAGES_LIVRAISON = ["1-3 jours", "3-7 jours", "1-2 semaines", "2-3 semaines", "Sur commande"];
const genNumero = () => "CMD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
const genCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const SUPABASE_URL = "https://nuhpdqioggxznceqvpvx.supabase.co";
const SUPPORT_EMAIL = "nahofalgbadamassi@gmail.com";
const MOMO_NUMERO = "+229 57577895";
const ADMIN_EMAIL = "nahofalgbadamassi@gmail.com";

const PAIEMENTS = [
  { id: "mtn", label: "MTN MoMo", icon: "💛" },
  { id: "moov", label: "Moov Money", icon: "🔵" },
  { id: "celtiis", label: "Celtiis", icon: "🟢" },
];

const sendEmail = async (to, subject, html) => {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });
  } catch (e) { console.log("Email error:", e); }
};

const emailCodeConfirmation = (prenom, code) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;padding:2rem;border-radius:16px;border:1px solid #e0e0e0;">
  <h2 style="color:#00A86B;text-align:center;">FastBuy 229</h2>
  <p>Bonjour ${prenom},</p>
  <p>Votre code de confirmation est :</p>
  <div style="background:#f5f5f5;border-radius:10px;padding:1.5rem;text-align:center;margin:1.5rem 0;">
    <h1 style="color:#00A86B;font-size:2.5rem;letter-spacing:0.5rem;margin:0;">${code}</h1>
  </div>
  <p style="color:#666;">Ce code expire dans 10 minutes.</p>
  <p style="color:#666;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
  <hr style="border:none;border-top:1px solid #e0e0e0;margin:1.5rem 0;">
  <p style="color:#999;font-size:12px;text-align:center;">FastBuy 229 — Marketplace Bénin<br>Contact : ${SUPPORT_EMAIL}</p>
</div>`;

const emailCommande = (cmd) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;padding:2rem;border-radius:16px;border:1px solid #e0e0e0;">
  <h2 style="color:#00A86B;text-align:center;">FastBuy 229</h2>
  <p>Bonjour ${cmd.nom},</p>
  <p>Votre commande a bien été reçue ! Voici le récapitulatif :</p>
  <div style="background:#f5f5f5;border-radius:10px;padding:1rem;margin:1rem 0;text-align:center;">
    <p style="margin:0;color:#666;">Numéro de commande</p>
    <h2 style="color:#F5C842;margin:0.5rem 0;">${cmd.numero}</h2>
  </div>
  <div style="margin:1rem 0;">
    ${cmd.articles?.map(a => `<div style="padding:8px 0;border-bottom:1px solid #e0e0e0;">${a.emoji || ""} ${a.title} × ${a.qty} — <strong>${(a.price*a.qty).toLocaleString()} FCFA</strong></div>`).join("")}
    ${cmd.codePromo ? `<div style="padding:8px 0;color:#00A86B;">🎟️ Code promo appliqué : -${cmd.reduction?.toLocaleString()} FCFA</div>` : ""}
    <div style="padding:1rem 0 0;font-size:1.1rem;"><strong>Total : ${cmd.totalFinal?.toLocaleString()} FCFA</strong></div>
  </div>
  <div style="background:#fff8e1;border:1px solid #F5C842;border-radius:10px;padding:1rem;margin:1rem 0;">
    <p><strong>💰 Paiement :</strong> Envoyez <strong>${cmd.totalFinal?.toLocaleString()} FCFA</strong> au <strong>${MOMO_NUMERO}</strong></p>
    <p><strong>Référence :</strong> ${cmd.numero}</p>
  </div>
  <p style="color:#666;">Livraison sous 3 jours à 2 semaines. Vous serez contacté au ${cmd.telephoneLivreur}.</p>
  <hr style="border:none;border-top:1px solid #e0e0e0;margin:1.5rem 0;">
  <p style="color:#999;font-size:12px;text-align:center;">FastBuy 229 — Contact : ${SUPPORT_EMAIL}</p>
</div>`;

const emailNotifAdmin = (cmd) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;padding:2rem;border-radius:16px;border:1px solid #e0e0e0;">
  <h2 style="color:#00A86B;">🔔 Nouvelle commande FastBuy 229</h2>
  <p><strong>Numéro :</strong> ${cmd.numero}</p>
  <p><strong>Client :</strong> ${cmd.nom}</p>
  <p><strong>Email :</strong> ${cmd.email}</p>
  <p><strong>Téléphone livreur :</strong> ${cmd.telephoneLivreur}</p>
  <p><strong>Ville :</strong> ${cmd.ville}</p>
  <p><strong>Adresse :</strong> ${cmd.adresse}</p>
  <p><strong>Total :</strong> ${cmd.totalFinal?.toLocaleString()} FCFA</p>
  <p><strong>Paiement :</strong> ${cmd.paiement}</p>
  ${cmd.codePromo ? `<p><strong>Code promo :</strong> ${cmd.codePromo}</p>` : ""}
  <p style="color:#F5A000;"><strong>⚠️ Vérifiez la capture de paiement dans votre espace admin.</strong></p>
</div>`;

export default function FastBuy229() {
  const [page, setPage] = useState("boutique");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [panier, setPanier] = useState([]);
  const [showPanier, setShowPanier] = useState(false);
  const [showCommande, setShowCommande] = useState(false);
  const [commandeOk, setCommandeOk] = useState(null);
  const [paiementChoisi, setPaiementChoisi] = useState("mtn");
  const [form, setForm] = useState({ nom: "", email: "", telephoneLivreur: "", ville: "", adresse: "" });
  const [codePromoSaisi, setCodePromoSaisi] = useState("");
  const [codePromoValide, setCodePromoValide] = useState(false);
  const [reductionPromo, setReductionPromo] = useState(0);
  const [produits, setProduits] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [numeroSuivi, setNumeroSuivi] = useState("");
  const [commandeTrouvee, setCommandeTrouvee] = useState(null);
  const [adminOk, setAdminOk] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ emoji: "🌸", title: "", description: "", price: "", etat: "Neuf", category: "Parfums", location: "", plage_livraison: "1-2 semaines" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [captureFile, setCaptureFile] = useState(null);
  const [capturePreview, setCapturePreview] = useState(null);
  const [client, setClient] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("register");
  const [authStep, setAuthStep] = useState(1);
  const [authForm, setAuthForm] = useState({ prenom: "", nom: "", email: "", telephone: "", code: "" });
  const [authCodeReel, setAuthCodeReel] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [produitNegocie, setProduitNegocie] = useState(null);
  const [messageTexte, setMessageTexte] = useState("");
  const [messages, setMessages] = useState([]);
  const [mesCommandes, setMesCommandes] = useState([]);
  const [showMesCommandes, setShowMesCommandes] = useState(false);
  const [adminMotDePasse, setAdminMotDePasse] = useState("Benin2025@!");
  const [showAdminForgot, setShowAdminForgot] = useState(false);
  const [adminForgotStep, setAdminForgotStep] = useState(1);
  const [adminForgotCode, setAdminForgotCode] = useState("");
  const [adminForgotCodeSaisi, setAdminForgotCodeSaisi] = useState("");
  const [adminForgotAncienPwd, setAdminForgotAncienPwd] = useState("");
  const [adminForgotNouveauPwd, setAdminForgotNouveauPwd] = useState("");
  const [adminForgotConfirmPwd, setAdminForgotConfirmPwd] = useState("");
  const [adminForgotError, setAdminForgotError] = useState("");

  useEffect(() => {
    chargerProduits();
    const savedClient = localStorage.getItem("fastbuy_client");
    if (savedClient) setClient(JSON.parse(savedClient));
    const savedPwd = localStorage.getItem("fastbuy_admin_pwd");
    if (savedPwd) setAdminMotDePasse(savedPwd);
    if (typeof window !== "undefined" && (window.location.pathname === "/admin" || window.location.search.includes("page=admin"))) setPage("admin");
  }, []);

  const chargerProduits = async () => {
    const { data } = await supabase.from("produits").select("*").order("created_at", { ascending: false });
    if (data) setProduits(data);
  };
  const chargerCommandes = async () => {
    const { data } = await supabase.from("commandes").select("*").order("created_at", { ascending: false });
    if (data) setCommandes(data);
  };
  const chargerMessages = async () => {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    if (data) setMessages(data);
  };
  const chargerMesCommandes = async (email) => {
    const { data } = await supabase.from("commandes").select("*").eq("email", email).order("created_at", { ascending: false });
    if (data) setMesCommandes(data);
  };
  const getImageUrl = (p) => p ? `${SUPABASE_URL}/storage/v1/object/public/produits/${p}` : null;

  // ── INSCRIPTION — Étape 1 : envoyer code ──
  const inscriptionEnvoyerCode = async () => {
    setAuthError("");
    if (!authForm.prenom || !authForm.nom || !authForm.email || !authForm.telephone) {
      setAuthError("Remplis tous les champs !"); return;
    }
    if (!authForm.email.includes("@")) { setAuthError("Email invalide !"); return; }
    setLoading(true);
    const { data: existing } = await supabase.from("users").select("id").eq("telephone", authForm.email).single();
    if (existing) { setAuthError("Cet email est déjà utilisé !"); setLoading(false); return; }
    const code = genCode();
    setAuthCodeReel(code);
    await sendEmail(authForm.email, "Votre code de confirmation — FastBuy 229", emailCodeConfirmation(authForm.prenom, code));
    setAuthStep(2);
    setLoading(false);
  };

  // ── INSCRIPTION — Étape 2 : valider code ──
  const inscriptionValiderCode = async () => {
    setAuthError("");
    if (authForm.code !== authCodeReel) { setAuthError("Code incorrect ! Vérifiez votre email."); return; }
    setLoading(true);
    const { data, error } = await supabase.from("users").insert([{
      nom: `${authForm.prenom} ${authForm.nom}`,
      telephone: authForm.email,
      mot_de_passe: authCodeReel,
      ville: "",
    }]).select().single();
    if (error) { setAuthError("Erreur ! Réessaie."); setLoading(false); return; }
    const clientData = { id: data.id, nom: `${authForm.prenom} ${authForm.nom}`, email: authForm.email, telephone: authForm.telephone, prenom: authForm.prenom, premiereCommande: true };
    setClient(clientData);
    localStorage.setItem("fastbuy_client", JSON.stringify(clientData));
    setShowAuth(false);
    setAuthStep(1);
    setAuthForm({ prenom: "", nom: "", email: "", telephone: "", code: "" });
    setLoading(false);
  };

  // ── CONNEXION — Étape 1 : envoyer code ──
  const connexionEnvoyerCode = async () => {
    setAuthError("");
    if (!authForm.email) { setAuthError("Entre ton email !"); return; }
    setLoading(true);
    const { data } = await supabase.from("users").select("*").eq("telephone", authForm.email).single();
    if (!data) { setAuthError("Aucun compte avec cet email !"); setLoading(false); return; }
    const code = genCode();
    setAuthCodeReel(code);
    await sendEmail(authForm.email, "Votre code de connexion — FastBuy 229", emailCodeConfirmation(data.nom.split(" ")[0], code));
    setAuthStep(2);
    setLoading(false);
  };

  // ── CONNEXION — Étape 2 : valider code ──
  const connexionValiderCode = async () => {
    setAuthError("");
    if (authForm.code !== authCodeReel) { setAuthError("Code incorrect ! Vérifiez votre email."); return; }
    setLoading(true);
    const { data } = await supabase.from("users").select("*").eq("telephone", authForm.email).single();
    const { data: cmdData } = await supabase.from("commandes").select("id").eq("email", authForm.email).limit(1);
    const clientData = { id: data.id, nom: data.nom, email: authForm.email, telephone: data.telephone, prenom: data.nom.split(" ")[0], premiereCommande: !cmdData || cmdData.length === 0 };
    setClient(clientData);
    localStorage.setItem("fastbuy_client", JSON.stringify(clientData));
    setShowAuth(false);
    setAuthStep(1);
    setAuthForm({ prenom: "", nom: "", email: "", telephone: "", code: "" });
    setLoading(false);
  };

  const deconnecter = () => { setClient(null); localStorage.removeItem("fastbuy_client"); };

  // ── CODE PROMO ──
  const verifierCodePromo = () => {
    if (!client) return;
    const codeAttendu = (client.prenom || client.nom.split(" ")[0]).toLowerCase() + "10";
    if (codePromoSaisi.toLowerCase() === codeAttendu && client.premiereCommande) {
      setReductionPromo(Math.round(total * 0.1));
      setCodePromoValide(true);
    } else if (!client.premiereCommande) {
      alert("Ce code promo est réservé à la première commande !");
    } else {
      alert("Code promo invalide !");
    }
  };

  // ── PANIER ──
  const ajouterAuPanier = (product) => {
    if (!client) { setShowAuth(true); setAuthMode("register"); setAuthStep(1); return; }
    setPanier((prev) => {
      const existe = prev.find((p) => p.id === product.id);
      if (existe) return prev.map((p) => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const retirerDuPanier = (id) => setPanier((prev) => prev.filter((p) => p.id !== id));
  const changerQty = (id, delta) => setPanier((prev) => prev.map((p) => p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p));
  const total = panier.reduce((acc, p) => acc + p.price * p.qty, 0);
  const totalFinal = total - reductionPromo;
  const nbPanier = panier.reduce((acc, p) => acc + p.qty, 0);

  const passerCommande = async () => {
    if (!form.nom || !form.email || !form.telephoneLivreur || !form.ville || !form.adresse) { alert("Remplis tous les champs !"); return; }
    if (!captureFile) { alert("Ajoute la capture d'écran de ton paiement !"); return; }
    setLoading(true);
    const numero = genNumero();
    let capturePath = null;
    const fileName = `captures/${Date.now()}-${captureFile.name}`;
    const { error: uploadError } = await supabase.storage.from("produits").upload(fileName, captureFile);
    if (!uploadError) capturePath = fileName;
    const cmdData = { numero, nom: form.nom, email: form.email, telephone: form.telephoneLivreur, telephoneLivreur: form.telephoneLivreur, ville: form.ville, adresse: form.adresse, articles: panier, total, totalFinal, reduction: reductionPromo, codePromo: codePromoValide ? codePromoSaisi : null, statut: "Commande reçue", paiement: paiementChoisi, user_id: client?.id, capture: capturePath };
    const { data, error } = await supabase.from("commandes").insert([cmdData]).select().single();
    if (error) { alert("Erreur ! Réessaie."); setLoading(false); return; }
    await sendEmail(form.email, `Commande ${numero} confirmée — FastBuy 229`, emailCommande({ ...cmdData, articles: panier }));
    await sendEmail(ADMIN_EMAIL, `🔔 Nouvelle commande ${numero}`, emailNotifAdmin(cmdData));
    if (codePromoValide) {
      const updatedClient = { ...client, premiereCommande: false };
      setClient(updatedClient);
      localStorage.setItem("fastbuy_client", JSON.stringify(updatedClient));
    }
    setCommandeOk(data);
    setPanier([]); setShowCommande(false); setShowPanier(false);
    setForm({ nom: "", email: "", telephoneLivreur: "", ville: "", adresse: "" });
    setCaptureFile(null); setCapturePreview(null);
    setCodePromoSaisi(""); setCodePromoValide(false); setReductionPromo(0);
    setLoading(false);
  };

  const changerStatut = async (id, statut) => {
    const cmd = commandes.find(c => c.id === id);
    await supabase.from("commandes").update({ statut }).eq("id", id);
    if (cmd?.email) {
      await sendEmail(cmd.email, `Mise à jour commande ${cmd.numero} — FastBuy 229`, `
        <div style="font-family:Arial;max-width:600px;margin:0 auto;padding:2rem;border:1px solid #e0e0e0;border-radius:16px;">
          <h2 style="color:#00A86B;">Mise à jour de votre commande</h2>
          <p>Bonjour,</p>
          <p>Votre commande <strong>${cmd.numero}</strong> a été mise à jour.</p>
          <p>Nouveau statut : <strong style="color:#00A86B;">${statut}</strong></p>
          <p style="color:#666;">Contact : <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        </div>
      `);
    }
    chargerCommandes();
  };

  const chercherCommande = async () => {
    const { data } = await supabase.from("commandes").select("*").ilike("numero", numeroSuivi).single();
    setCommandeTrouvee(data || "introuvable");
  };

  const envoyerMessage = async () => {
    if (!messageTexte) return;
    await supabase.from("messages").insert([{ user_id: client?.id, nom: client?.nom, telephone: client?.email, message: produitNegocie ? `Négociation sur "${produitNegocie.title}" (${produitNegocie.price.toLocaleString()} FCFA) : ${messageTexte}` : messageTexte }]);
    setMessageTexte(""); setShowMessage(false); setProduitNegocie(null);
    alert("Message envoyé ! On te répond bientôt 😊");
  };

  const repondreMessage = async (id, reponse, clientEmail) => {
    await supabase.from("messages").update({ reponse }).eq("id", id);
    if (clientEmail?.includes("@")) {
      await sendEmail(clientEmail, "Réponse à votre message — FastBuy 229", `
        <div style="font-family:Arial;max-width:600px;margin:0 auto;padding:2rem;border:1px solid #e0e0e0;border-radius:16px;">
          <h2 style="color:#00A86B;">Réponse de FastBuy 229</h2>
          <p>Bonjour,</p>
          <div style="background:#f5f5f5;padding:1rem;border-radius:8px;margin:1rem 0;">${reponse}</div>
          <p style="color:#666;">Contact : <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        </div>
      `);
    }
    chargerMessages();
  };

  const handleImageChange = (e) => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } };
  const handleCaptureChange = (e) => { const f = e.target.files[0]; if (f) { setCaptureFile(f); setCapturePreview(URL.createObjectURL(f)); } };

  const ajouterProduit = async () => {
    if (!newProduct.title || !newProduct.price || !newProduct.location) { alert("Remplis tous les champs !"); return; }
    setLoading(true);
    let imagePath = null;
    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from("produits").upload(fileName, imageFile);
      if (!uploadError) imagePath = fileName;
    }
    await supabase.from("produits").insert([{ ...newProduct, price: parseInt(newProduct.price), image: imagePath }]);
    await chargerProduits();
    setShowAddProduct(false);
    setNewProduct({ emoji: "🌸", title: "", description: "", price: "", etat: "Neuf", category: "Parfums", location: "", plage_livraison: "1-2 semaines" });
    setImageFile(null); setImagePreview(null); setLoading(false);
  };

  const supprimerProduit = async (id) => { if (!confirm("Supprimer ?")) return; await supabase.from("produits").delete().eq("id", id); chargerProduits(); };

  const adminForgotEnvoyerCode = async () => {
    setAdminForgotError(""); setLoading(true);
    const code = genCode();
    setAdminForgotCode(code);
    await sendEmail(ADMIN_EMAIL, "Votre code admin — FastBuy 229", emailCodeConfirmation("Admin", code));
    setAdminForgotStep(2); setLoading(false);
  };

  const adminForgotChangerPwd = () => {
    setAdminForgotError("");
    if (adminForgotCodeSaisi !== adminForgotCode) { setAdminForgotError("Code incorrect !"); return; }
    if (adminForgotAncienPwd !== adminMotDePasse) { setAdminForgotError("Ancien mot de passe incorrect !"); return; }
    if (adminForgotNouveauPwd.length < 6) { setAdminForgotError("Mot de passe trop court !"); return; }
    if (adminForgotNouveauPwd !== adminForgotConfirmPwd) { setAdminForgotError("Les mots de passe ne correspondent pas !"); return; }
    setAdminMotDePasse(adminForgotNouveauPwd);
    localStorage.setItem("fastbuy_admin_pwd", adminForgotNouveauPwd);
    setShowAdminForgot(false); setAdminForgotStep(1);
    setAdminForgotAncienPwd(""); setAdminForgotNouveauPwd(""); setAdminForgotConfirmPwd(""); setAdminForgotCodeSaisi("");
    alert("Mot de passe admin modifié ! 🎉");
  };

  const filtered = produits.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const inp = { width: "100%", padding: "11px 14px", background: "#1C2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13, fontFamily: "DM Sans, sans-serif", outline: "none" };

  const Logo = () => (
    <span style={{ fontFamily: "Syne", fontSize: 21, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
      Fast<span style={{ color: "#00A86B" }}>Buy</span><span style={{ color: "#F5C842" }}> 229</span>
      <span style={{ display: "inline-block", width: 7, height: 7, background: "#F5C842", borderRadius: "50%", marginLeft: 3, verticalAlign: "middle", marginBottom: 3 }} />
    </span>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0B0E18", color: "#fff", fontFamily: "DM Sans, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0B0E18; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
        select option { background: #1C2035; color: #fff; }
        .cat:hover { border-color: #00A86B !important; background: rgba(0,168,107,0.09) !important; cursor: pointer; }
        .card:hover { transform: translateY(-4px); border-color: rgba(0,168,107,0.4) !important; }
        .bg:hover { background: #007A4D !important; }
        .pay:hover { border-color: #00A86B !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes fi { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes si { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes pi { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ display: "flex", alignItems: "center", padding: "0 2rem", height: 62, background: "rgba(11,14,24,0.96)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, zIndex: 100, gap: "1rem", flexWrap: "wrap" }}>
        <div onClick={() => setPage("boutique")}><Logo /></div>
        {page === "boutique" && (
          <div style={{ flex: 1, maxWidth: 440, display: "flex", alignItems: "center", background: "#1C2035", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 11, padding: "0 14px", gap: 8 }}>
            <span>🔍</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cherche un produit…" style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, padding: "11px 0", flex: 1, fontFamily: "DM Sans" }} />
            {search && <span onClick={() => setSearch("")} style={{ cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 18 }}>×</span>}
          </div>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setPage("suivi")} style={{ padding: "8px 14px", borderRadius: 9, fontSize: 13, background: "none", border: "1px solid rgba(255,255,255,0.13)", color: "#fff", cursor: "pointer", fontFamily: "DM Sans" }}>📦 Suivi</button>
          <button onClick={() => setPage("aide")} style={{ padding: "8px 14px", borderRadius: 9, fontSize: 13, background: "none", border: "1px solid rgba(255,255,255,0.13)", color: "#fff", cursor: "pointer", fontFamily: "DM Sans" }}>❓ Aide</button>
          {page === "boutique" && (
            <button onClick={() => setShowPanier(true)} style={{ position: "relative", padding: "8px 16px", borderRadius: 9, fontSize: 13, background: "rgba(0,168,107,0.1)", border: "1px solid rgba(0,168,107,0.3)", color: "#00A86B", cursor: "pointer", fontFamily: "DM Sans", fontWeight: 500 }}>
              🛒 Panier
              {nbPanier > 0 && <span style={{ position: "absolute", top: -8, right: -8, background: "#F5C842", color: "#0B0E18", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{nbPanier}</span>}
            </button>
          )}
          {client ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => { chargerMesCommandes(client.email); setShowMesCommandes(true); }} style={{ padding: "8px 14px", borderRadius: 9, fontSize: 13, background: "rgba(0,168,107,0.1)", border: "1px solid rgba(0,168,107,0.3)", color: "#00A86B", cursor: "pointer", fontFamily: "DM Sans" }}>
                👤 {client.prenom || client.nom.split(" ")[0]}
              </button>
              <button onClick={() => { setProduitNegocie(null); setShowMessage(true); }} style={{ padding: "8px 12px", borderRadius: 9, fontSize: 13, background: "none", border: "1px solid rgba(255,255,255,0.13)", color: "#fff", cursor: "pointer" }}>💬</button>
              <button onClick={deconnecter} style={{ padding: "8px 12px", borderRadius: 9, fontSize: 12, background: "none", border: "1px solid rgba(255,80,80,0.3)", color: "rgba(255,100,100,0.7)", cursor: "pointer" }}>×</button>
            </div>
          ) : (
            <button onClick={() => { setShowAuth(true); setAuthMode("login"); setAuthStep(1); }} style={{ padding: "8px 16px", borderRadius: 9, fontSize: 13, background: "none", border: "1px solid rgba(255,255,255,0.13)", color: "#fff", cursor: "pointer", fontFamily: "DM Sans" }}>
              👤 Se connecter
            </button>
          )}
        </div>
      </nav>

      {/* BOUTIQUE */}
      {page === "boutique" && (
        <>
          <div style={{ position: "relative", minHeight: 420, display: "flex", alignItems: "center", overflow: "hidden", background: "linear-gradient(135deg, #0B0E18 0%, #161926 100%)" }}>
            <div style={{ position: "relative", zIndex: 2, padding: "3rem 2.5rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,168,107,0.12)", border: "1px solid rgba(0,168,107,0.28)", borderRadius: 999, padding: "6px 16px", fontSize: 13, color: "#00A86B", marginBottom: "1.5rem" }}>
                <span style={{ width: 7, height: 7, background: "#00A86B", borderRadius: "50%", animation: "pulse 2s infinite", display: "inline-block" }} />
                Livraison 3 jours à 2 semaines selon ta ville
              </div>
              <h1 style={{ fontFamily: "Syne", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                Mode, Tech & Style<br /><span style={{ color: "#00A86B" }}>livrés partout</span> au<br /><span style={{ color: "#F5C842" }}>Bénin</span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 15, lineHeight: 1.75, marginBottom: "2rem", maxWidth: 420 }}>
                Commande en ligne — Paiement MTN MoMo, Moov, Celtiis — Cotonou, Porto-Novo, Calavi, Parakou, Ouidah.
              </p>
              <div style={{ display: "flex", gap: "2.5rem" }}>
                {[[produits.length + "+", "Produits"], ["3j-2sem", "Livraison"], ["98%", "Satisfaits"]].map(([n, l]) => (
                  <div key={l}><div style={{ fontFamily: "Syne", fontSize: "1.8rem", fontWeight: 800, color: "#00A86B" }}>{n}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>{l}</div></div>
                ))}
              </div>
            </div>
          </div>

          <section style={{ padding: "2rem 2rem 1rem" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "1.1rem", fontWeight: 700 }}>Catégories</h2>
              <span onClick={() => setActiveCategory(null)} style={{ fontSize: 13, color: "#00A86B", marginLeft: "auto", cursor: "pointer" }}>Tout voir</span>
            </div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="cat" onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)} style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, background: activeCategory === cat.name ? "rgba(0,168,107,0.12)" : "#161926", border: `1px solid ${activeCategory === cat.name ? "#00A86B" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "10px 18px", whiteSpace: "nowrap", transition: "all 0.18s" }}>
                  <span style={{ fontSize: "1.4rem" }}>{cat.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{cat.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={{ padding: "1rem 2rem 3rem" }}>
            <h2 style={{ fontFamily: "Syne", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              {activeCategory || "Tous les produits"}
              {activeCategory && <span onClick={() => setActiveCategory(null)} style={{ fontSize: 12, color: "#00A86B", marginLeft: 10, cursor: "pointer", fontWeight: 400 }}>× effacer</span>}
            </h2>
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.25)" }}><div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛍️</div>Aucun produit disponible</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {filtered.map((item, idx) => (
                <div key={item.id} className="card" style={{ background: "#161926", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", transition: "transform 0.18s, border-color 0.18s", animation: "fi 0.3s ease both", animationDelay: `${idx * 0.04}s` }}>
                  <div style={{ height: 180, background: "#1C2035", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                    {getImageUrl(item.image) ? <img src={getImageUrl(item.image)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "3rem" }}>{item.emoji}</span>}
                    <span style={{ position: "absolute", top: 10, left: 10, background: "#00A86B", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6 }}>{item.etat}</span>
                    <span onClick={(e) => { e.stopPropagation(); setFavorites((prev) => ({ ...prev, [item.id]: !prev[item.id] })); }} style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.45)", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, cursor: "pointer" }}>{favorites[item.id] ? "❤️" : "🤍"}</span>
                    {item.plage_livraison && <span style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(0,0,0,0.6)", color: "#F5C842", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6 }}>🚚 {item.plage_livraison}</span>}
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>📍 {item.location}</div>
                    <div style={{ fontFamily: "Syne", fontSize: "1rem", fontWeight: 800, color: "#00A86B", marginBottom: 10 }}>{item.price.toLocaleString()} <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "DM Sans", fontWeight: 400 }}>FCFA</span></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => ajouterAuPanier(item)} className="bg" style={{ flex: 1, padding: "9px 0", background: "#00A86B", color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "DM Sans", transition: "background 0.18s" }}>
                        {client ? "🛒 Acheter" : "🔒 Connexion"}
                      </button>
                      {client && (
                        <button onClick={() => { setProduitNegocie(item); setMessageTexte(""); setShowMessage(true); }} style={{ padding: "9px 10px", background: "rgba(245,200,66,0.1)", border: "1px solid rgba(245,200,66,0.3)", borderRadius: 9, fontSize: 14, cursor: "pointer", color: "#F5C842" }}>💬</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer style={{ background: "#0D1020", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "1.8rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <Logo />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>© 2025 FastBuy 229 · Bénin</span>
          </footer>
        </>
      )}

      {/* AIDE */}
      {page === "aide" && (
        <div style={{ maxWidth: 600, margin: "4rem auto", padding: "0 1.5rem" }}>
          <h2 style={{ fontFamily: "Syne", fontSize: "1.5rem", fontWeight: 800, marginBottom: "2rem" }}>❓ Centre d'aide</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: "2.5rem" }}>
            {[
              ["📦", "Comment suivre ma commande ?", "Rendez-vous dans l'onglet 'Suivi' puis entrez votre numéro de commande (ex : CMD-AB12CD). Votre numéro vous est envoyé par email après confirmation."],
              ["💳", "Quels sont les moyens de paiement ?", `Paiement via MTN MoMo, Moov Money ou Celtiis. Envoyez le montant exact au ${MOMO_NUMERO} avec votre numéro de commande comme référence, puis uploadez la capture d'écran.`],
              ["🚚", "Délais de livraison ?", "Entre 3 jours et 2 semaines selon votre ville et le produit."],
              ["⏰", "Livraison en retard ?", "Si votre commande dépasse le délai, vous recevrez 10% remboursés sur votre Mobile Money."],
              ["🔄", "Retour produit ?", "Contactez-nous par email dans les 48h après réception."],
              ["💬", "Négocier un prix ?", "Cliquez sur 💬 directement sur le produit pour nous envoyer votre offre."],
              ["🎟️", "Code promo ?", "Entrez votre prénom + 10 (ex: marc10) dans la case code promo. Valable sur votre 1ère commande uniquement !"],
            ].map(([icon, q, a]) => (
              <div key={q} style={{ background: "#161926", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "1.2rem 1.5rem" }}>
                <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: "0.95rem", marginBottom: 8 }}>{icon} {q}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{a}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(0,168,107,0.1)", border: "1px solid rgba(0,168,107,0.3)", borderRadius: 16, padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📧</div>
            <h3 style={{ fontFamily: "Syne", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Besoin d'aide ?</h3>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ display: "inline-block", padding: "12px 28px", background: "#00A86B", color: "#fff", borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: "none", marginTop: "0.8rem" }}>✉️ {SUPPORT_EMAIL}</a>
          </div>
        </div>
      )}

      {/* SUIVI */}
      {page === "suivi" && (
        <div style={{ maxWidth: 500, margin: "4rem auto", padding: "0 1.5rem" }}>
          <h2 style={{ fontFamily: "Syne", fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>📦 Suivre ma commande</h2>
          <div style={{ display: "flex", gap: 10, marginBottom: "2rem" }}>
            <input type="text" value={numeroSuivi} onChange={(e) => setNumeroSuivi(e.target.value)} placeholder="Ex: CMD-AB12CD" style={{ ...inp, flex: 1 }} />
            <button onClick={chercherCommande} className="bg" style={{ padding: "11px 20px", background: "#00A86B", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "DM Sans", whiteSpace: "nowrap" }}>Chercher</button>
          </div>
          {commandeTrouvee === "introuvable" && <div style={{ background: "#1C2035", borderRadius: 14, padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>❌ Aucune commande trouvée</div>}
          {commandeTrouvee && commandeTrouvee !== "introuvable" && (
            <div style={{ background: "#161926", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <div>
                  <div style={{ fontFamily: "Syne", fontWeight: 700 }}>{commandeTrouvee.numero}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{new Date(commandeTrouvee.created_at).toLocaleString("fr-FR")}</div>
                </div>
                <span style={{ background: "rgba(0,168,107,0.15)", color: "#00A86B", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{commandeTrouvee.statut}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem", gap: 4 }}>
                {STATUTS.map((s, i) => {
                  const cur = STATUTS.indexOf(commandeTrouvee.statut);
                  const done = i <= cur;
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? "#00A86B" : "#1C2035", border: `2px solid ${done ? "#00A86B" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{done ? "✓" : i + 1}</div>
                      {i < STATUTS.length - 1 && <div style={{ flex: 1, height: 2, background: i < cur ? "#00A86B" : "rgba(255,255,255,0.1)" }} />}
                    </div>
                  );
                })}
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1rem" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Client : <span style={{ color: "#fff" }}>{commandeTrouvee.nom}</span></div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Ville : <span style={{ color: "#fff" }}>{commandeTrouvee.ville}</span></div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Total : <span style={{ color: "#00A86B", fontWeight: 700 }}>{(commandeTrouvee.totalFinal || commandeTrouvee.total)?.toLocaleString()} FCFA</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADMIN LOGIN */}
      {page === "admin" && !adminOk && (
        <div style={{ maxWidth: 400, margin: "5rem auto", padding: "0 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
          <h2 style={{ fontFamily: "Syne", fontSize: "1.3rem", fontWeight: 800, marginBottom: "1.5rem" }}>Espace Admin — FastBuy 229</h2>
          {!showAdminForgot ? (
            <>
              <input type="password" value={adminPwd} onChange={(e) => setAdminPwd(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (adminPwd === adminMotDePasse ? (setAdminOk(true), chargerCommandes(), chargerMessages()) : alert("Accès refusé !"))} placeholder="••••••••" style={{ ...inp, marginBottom: 12, textAlign: "center", letterSpacing: "0.2em" }} />
              <button onClick={() => { if (adminPwd === adminMotDePasse) { setAdminOk(true); chargerCommandes(); chargerMessages(); } else alert("Accès refusé !"); }} className="bg" style={{ width: "100%", padding: "12px 0", background: "#00A86B", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "DM Sans", marginBottom: 12 }}>Accéder</button>
              <button onClick={() => setShowAdminForgot(true)} style={{ background: "none", border: "none", color: "#00A86B", fontSize: 13, cursor: "pointer", fontFamily: "DM Sans" }}>🔑 Modifier mon mot de passe</button>
            </>
          ) : (
            <div style={{ background: "#161926", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "1.5rem", textAlign: "left" }}>
              <h3 style={{ fontFamily: "Syne", fontSize: "1rem", fontWeight: 700, marginBottom: "1.2rem", textAlign: "center" }}>🔑 Modifier le mot de passe</h3>
              {adminForgotError && <div style={{ background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "rgba(255,120,120,0.9)", marginBottom: "1rem" }}>{adminForgotError}</div>}
              {adminForgotStep === 1 && (
                <>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: "1rem" }}>Un code sera envoyé à : <strong style={{ color: "#00A86B" }}>{ADMIN_EMAIL}</strong></p>
                  <button onClick={adminForgotEnvoyerCode} disabled={loading} className="bg" style={{ width: "100%", padding: "12px 0", background: "#00A86B", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "DM Sans" }}>{loading ? "Envoi…" : "📧 Recevoir le code"}</button>
                </>
              )}
              {adminForgotStep === 2 && (
                <>
                  <div style={{ background: "rgba(0,168,107,0.1)", border: "1px solid rgba(0,168,107,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#00A86B", marginBottom: "1rem" }}>✅ Code envoyé à {ADMIN_EMAIL}</div>
                  {[["Code reçu", adminForgotCodeSaisi, setAdminForgotCodeSaisi, "123456", false], ["Ancien mot de passe", adminForgotAncienPwd, setAdminForgotAncienPwd, "••••••••", true], ["Nouveau mot de passe", adminForgotNouveauPwd, setAdminForgotNouveauPwd, "••••••••", true], ["Confirmer nouveau mot de passe", adminForgotConfirmPwd, setAdminForgotConfirmPwd, "••••••••", true]].map(([label, val, setter, ph, isPwd]) => (
                    <div key={label} style={{ marginBottom: "0.8rem" }}>
                      <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>{label}</label>
                      <input type={isPwd ? "password" : "text"} placeholder={ph} value={val} onChange={(e) => setter(e.target.value)} style={{ ...inp, ...(label === "Code reçu" ? { textAlign: "center", fontSize: "1.3rem", letterSpacing: "0.3em" } : {}) }} maxLength={label === "Code reçu" ? 6 : undefined} />
                    </div>
                  ))}
                  <button onClick={adminForgotChangerPwd} className="bg" style={{ width: "100%", padding: "12px 0", background: "#00A86B", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "DM Sans", marginTop: 4 }}>✅ Valider</button>
                </>
              )}
              <button onClick={() => { setShowAdminForgot(false); setAdminForgotStep(1); setAdminForgotError(""); }} style={{ width: "100%", padding: "10px 0", background: "transparent", color: "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "DM Sans", marginTop: 8 }}>← Retour</button>
            </div>
          )}
        </div>
      )}

      {/* ADMIN DASHBOARD */}
      {page === "admin" && adminOk && (
        <div style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ fontFamily: "Syne", fontSize: "1.4rem", fontWeight: 800 }}>⚙️ FastBuy 229 — Admin</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {[[commandes.length, "Commandes", "#00A86B"], [commandes.reduce((a, c) => a + (c.totalFinal || c.total || 0), 0).toLocaleString(), "FCFA", "#F5C842"], [produits.length, "Produits", "#3B82F6"], [messages.length, "Messages", "#A855F7"]].map(([n, l, c]) => (
                <div key={l} style={{ background: "#161926", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 16px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Syne", fontSize: "1.3rem", fontWeight: 800, color: c }}>{n}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{l}</div>
                </div>
              ))}
              <button onClick={() => { setAdminOk(false); setAdminPwd(""); }} style={{ padding: "8px 16px", borderRadius: 9, fontSize: 13, background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "rgba(255,100,100,0.8)", cursor: "pointer", fontFamily: "DM Sans" }}>🚪 Déconnexion</button>
            </div>
          </div>

          <button onClick={() => setShowAddProduct(true)} className="bg" style={{ padding: "12px 24px", background: "#00A86B", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "DM Sans", marginBottom: "2rem" }}>+ Ajouter un produit</button>

          <h3 style={{ fontFamily: "Syne", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Produits ({produits.length})</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12, marginBottom: "2.5rem" }}>
            {produits.map((p) => (
              <div key={p.id} style={{ background: "#161926", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
                {getImageUrl(p.image) ? <img src={getImageUrl(p.image)} alt={p.title} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }} /> : <span style={{ fontSize: "2rem" }}>{p.emoji}</span>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "#00A86B", fontWeight: 700 }}>{p.price.toLocaleString()} FCFA</div>
                  {p.plage_livraison && <div style={{ fontSize: 11, color: "#F5C842" }}>🚚 {p.plage_livraison}</div>}
                </div>
                <span onClick={() => supprimerProduit(p.id)} style={{ cursor: "pointer", color: "rgba(255,80,80,0.7)", fontSize: 18 }}>🗑</span>
              </div>
            ))}
          </div>

          <h3 style={{ fontFamily: "Syne", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>💬 Messages ({messages.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "2.5rem" }}>
            {messages.length === 0 ? <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.25)" }}>Aucun message</div> :
              messages.map((msg) => (
                <div key={msg.id} style={{ background: "#161926", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "1.2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{msg.nom} — {msg.telephone}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{new Date(msg.created_at).toLocaleString("fr-FR")}</div>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 10, background: "#1C2035", padding: "10px 14px", borderRadius: 8 }}>{msg.message}</div>
                  {msg.reponse ? (
                    <div style={{ fontSize: 13, color: "#00A86B", background: "rgba(0,168,107,0.1)", padding: "10px 14px", borderRadius: 8 }}>✅ {msg.reponse}</div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" placeholder="Ta réponse…" id={`rep-${msg.id}`} style={{ ...inp, flex: 1 }} />
                      <button onClick={() => { const val = document.getElementById(`rep-${msg.id}`).value; if (val) repondreMessage(msg.id, val, msg.telephone); }} className="bg" style={{ padding: "10px 16px", background: "#00A86B", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, cursor: "pointer", fontFamily: "DM Sans" }}>Répondre</button>
                    </div>
                  )}
                </div>
              ))}
          </div>

          <h3 style={{ fontFamily: "Syne", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Commandes ({commandes.length})</h3>
          {commandes.length === 0 ? <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.25)" }}><div style={{ fontSize: "3rem" }}>📭</div>Aucune commande</div> :
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {commandes.map((cmd) => (
                <div key={cmd.id} style={{ background: "#161926", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.2rem 1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: "1rem", marginBottom: 3 }}>{cmd.numero}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{new Date(cmd.created_at).toLocaleString("fr-FR")}</div>
                      <div style={{ fontSize: 11, color: "#F5C842", marginTop: 3 }}>💰 {cmd.paiement} {cmd.codePromo && `| 🎟️ ${cmd.codePromo}`}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "Syne", fontWeight: 800, color: "#00A86B", fontSize: "1.1rem" }}>{(cmd.totalFinal || cmd.total)?.toLocaleString()} FCFA</span>
                      <select value={cmd.statut} onChange={(e) => changerStatut(cmd.id, e.target.value)} style={{ background: "#1C2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", padding: "6px 10px", fontSize: 13, fontFamily: "DM Sans", cursor: "pointer", outline: "none" }}>
                        {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: cmd.capture ? "1rem" : 0 }}>
                    <div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>CLIENT</div><div style={{ fontSize: 13 }}>{cmd.nom}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{cmd.email}</div></div>
                    <div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>TÉL. LIVREUR</div><div style={{ fontSize: 13, color: "#F5C842" }}>{cmd.telephoneLivreur}</div></div>
                    <div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>LIVRAISON</div><div style={{ fontSize: 13 }}>{cmd.ville}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{cmd.adresse}</div></div>
                    <div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>ARTICLES</div>{cmd.articles?.map((a, i) => <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{a.emoji} {a.title} × {a.qty}</div>)}</div>
                  </div>
                  {cmd.capture && (
                    <div style={{ marginTop: "1rem" }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>📸 CAPTURE PAIEMENT</div>
                      <img src={getImageUrl(cmd.capture)} alt="capture" style={{ maxWidth: 300, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* AUTH */}
      {showAuth && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#161926", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 440, animation: "pi 0.3s ease", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "1.2rem", fontWeight: 700 }}>
                {authMode === "register" ? "✨ Créer un compte" : "👤 Se connecter"}
              </h2>
              <span onClick={() => { setShowAuth(false); setAuthStep(1); setAuthError(""); }} style={{ cursor: "pointer", fontSize: 22, color: "rgba(255,255,255,0.4)" }}>×</span>
            </div>

            {authError && <div style={{ background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "rgba(255,120,120,0.9)", marginBottom: "1rem" }}>{authError}</div>}

            {/* INSCRIPTION ÉTAPE 1 */}
            {authMode === "register" && authStep === 1 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>Prénom</label>
                    <input type="text" placeholder="Marc" value={authForm.prenom} onChange={(e) => setAuthForm({ ...authForm, prenom: e.target.value })} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>Nom</label>
                    <input type="text" placeholder="Dupont" value={authForm.nom} onChange={(e) => setAuthForm({ ...authForm, nom: e.target.value })} style={inp} />
                  </div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>📧 Email</label>
                  <input type="email" placeholder="exemple@gmail.com" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} style={inp} />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>📱 Téléphone</label>
                  <input type="tel" placeholder="+229 97 00 00 00" value={authForm.telephone} onChange={(e) => setAuthForm({ ...authForm, telephone: e.target.value })} style={inp} />
                </div>
                {authForm.prenom && (
                  <div style={{ background: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: "1rem" }}>
                    🎟️ Ton code promo : <strong style={{ color: "#F5C842" }}>{authForm.prenom.toLowerCase()}10</strong> — 10% sur ta 1ère commande !
                  </div>
                )}
                <button onClick={inscriptionEnvoyerCode} disabled={loading} className="bg" style={{ width: "100%", padding: "13px 0", background: loading ? "#555" : "#00A86B", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans", marginBottom: "1rem" }}>
                  {loading ? "Envoi du code…" : "📧 Recevoir mon code de confirmation"}
                </button>
              </>
            )}

            {/* INSCRIPTION ÉTAPE 2 */}
            {authMode === "register" && authStep === 2 && (
              <>
                <div style={{ background: "rgba(0,168,107,0.1)", border: "1px solid rgba(0,168,107,0.3)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#00A86B", marginBottom: "1.5rem" }}>
                  ✅ Code envoyé à <strong>{authForm.email}</strong> — Vérifiez vos spams si besoin.
                </div>
                <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>Saisissez le code reçu par mail</label>
                <input type="text" placeholder="_ _ _ _ _ _" value={authForm.code} onChange={(e) => setAuthForm({ ...authForm, code: e.target.value })} style={{ ...inp, textAlign: "center", fontSize: "2rem", letterSpacing: "0.5em", marginBottom: 16 }} maxLength={6} />
                <button onClick={inscriptionValiderCode} disabled={loading} className="bg" style={{ width: "100%", padding: "13px 0", background: loading ? "#555" : "#00A86B", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans", marginBottom: "0.8rem" }}>
                  {loading ? "Vérification…" : "✅ Confirmer et créer mon compte"}
                </button>
                <button onClick={() => { setAuthStep(1); setAuthError(""); }} style={{ width: "100%", padding: "10px 0", background: "transparent", color: "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "DM Sans" }}>← Retour</button>
              </>
            )}

            {/* CONNEXION ÉTAPE 1 */}
            {authMode === "login" && authStep === 1 && (
              <>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>📧 Votre email</label>
                  <input type="email" placeholder="exemple@gmail.com" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} style={inp} />
                </div>
                <button onClick={connexionEnvoyerCode} disabled={loading} className="bg" style={{ width: "100%", padding: "13px 0", background: loading ? "#555" : "#00A86B", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans", marginBottom: "1rem" }}>
                  {loading ? "Envoi…" : "📧 Recevoir le code de confirmation sur votre mail"}
                </button>
              </>
            )}

            {/* CONNEXION ÉTAPE 2 */}
            {authMode === "login" && authStep === 2 && (
              <>
                <div style={{ background: "rgba(0,168,107,0.1)", border: "1px solid rgba(0,168,107,0.3)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#00A86B", marginBottom: "1.5rem" }}>
                  ✅ Code envoyé à <strong>{authForm.email}</strong> — Vérifiez vos spams si besoin.
                </div>
                <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>Saisissez le code reçu par mail</label>
                <input type="text" placeholder="_ _ _ _ _ _" value={authForm.code} onChange={(e) => setAuthForm({ ...authForm, code: e.target.value })} style={{ ...inp, textAlign: "center", fontSize: "2rem", letterSpacing: "0.5em", marginBottom: 16 }} maxLength={6} />
                <button onClick={connexionValiderCode} disabled={loading} className="bg" style={{ width: "100%", padding: "13px 0", background: loading ? "#555" : "#00A86B", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans", marginBottom: "0.8rem" }}>
                  {loading ? "Connexion…" : "✅ Me connecter"}
                </button>
                <button onClick={() => { setAuthStep(1); setAuthError(""); }} style={{ width: "100%", padding: "10px 0", background: "transparent", color: "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "DM Sans" }}>← Retour</button>
              </>
            )}

            <div style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: "1rem" }}>
              {authMode === "register" ? (
                <span>Déjà un compte ? <span onClick={() => { setAuthMode("login"); setAuthStep(1); setAuthError(""); }} style={{ color: "#00A86B", cursor: "pointer", fontWeight: 500 }}>Se connecter</span></span>
              ) : (
                <span>Pas de compte ? <span onClick={() => { setAuthMode("register"); setAuthStep(1); setAuthError(""); }} style={{ color: "#00A86B", cursor: "pointer", fontWeight: 500 }}>S'inscrire gratuitement</span></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MES COMMANDES */}
      {showMesCommandes && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#161926", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 500, animation: "pi 0.3s ease", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "1.2rem", fontWeight: 700 }}>📦 Mes commandes</h2>
              <span onClick={() => setShowMesCommandes(false)} style={{ cursor: "pointer", fontSize: 22, color: "rgba(255,255,255,0.4)" }}>×</span>
            </div>
            {mesCommandes.length === 0 ? <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.3)" }}>Aucune commande</div> :
              mesCommandes.map((cmd) => (
                <div key={cmd.id} style={{ background: "#1C2035", borderRadius: 12, padding: "1rem", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontFamily: "Syne", fontWeight: 700 }}>{cmd.numero}</div>
                    <span style={{ background: "rgba(0,168,107,0.15)", color: "#00A86B", padding: "3px 10px", borderRadius: 999, fontSize: 12 }}>{cmd.statut}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{new Date(cmd.created_at).toLocaleString("fr-FR")}</div>
                  <div style={{ fontSize: 13, color: "#00A86B", fontWeight: 700 }}>{(cmd.totalFinal || cmd.total)?.toLocaleString()} FCFA</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MESSAGE */}
      {showMessage && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#161926", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 440, animation: "pi 0.3s ease", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "1.2rem", fontWeight: 700 }}>{produitNegocie ? "💬 Négocier le prix" : "💬 Message"}</h2>
              <span onClick={() => { setShowMessage(false); setProduitNegocie(null); }} style={{ cursor: "pointer", fontSize: 22, color: "rgba(255,255,255,0.4)" }}>×</span>
            </div>
            {produitNegocie && (
              <div style={{ background: "#1C2035", borderRadius: 10, padding: "12px 14px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 10 }}>
                {getImageUrl(produitNegocie.image) ? <img src={getImageUrl(produitNegocie.image)} alt={produitNegocie.title} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }} /> : <span style={{ fontSize: "2rem" }}>{produitNegocie.emoji}</span>}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{produitNegocie.title}</div>
                  <div style={{ fontSize: 12, color: "#00A86B", fontWeight: 700 }}>{produitNegocie.price.toLocaleString()} FCFA</div>
                </div>
              </div>
            )}
            <textarea value={messageTexte} onChange={(e) => setMessageTexte(e.target.value)} placeholder={produitNegocie ? `Ex: Je propose ${Math.round(produitNegocie?.price * 0.85).toLocaleString()} FCFA, c'est possible ?` : "Ta question ou demande…"} style={{ ...inp, height: 120, resize: "none" }} />
            <button onClick={envoyerMessage} className="bg" style={{ width: "100%", padding: "13px 0", background: "#00A86B", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans", marginTop: "1rem" }}>Envoyer 📤</button>
          </div>
        </div>
      )}

      {/* PANIER */}
      {showPanier && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          <div onClick={() => setShowPanier(false)} style={{ flex: 1, background: "rgba(0,0,0,0.6)" }} />
          <div style={{ width: 400, background: "#161926", borderLeft: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", animation: "si 0.3s ease" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "1.1rem", fontWeight: 700 }}>🛒 Panier ({nbPanier})</h2>
              <span onClick={() => setShowPanier(false)} style={{ cursor: "pointer", fontSize: 22, color: "rgba(255,255,255,0.4)" }}>×</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
              {panier.length === 0 ? <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.3)" }}><div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>Panier vide</div> :
                panier.map((p) => (
                  <div key={p.id} style={{ background: "#1C2035", borderRadius: 12, padding: "12px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                    {getImageUrl(p.image) ? <img src={getImageUrl(p.image)} alt={p.title} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }} /> : <span style={{ fontSize: "2rem" }}>{p.emoji}</span>}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: "#00A86B", fontWeight: 700 }}>{(p.price * p.qty).toLocaleString()} FCFA</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => changerQty(p.id, -1)} style={{ width: 26, height: 26, borderRadius: 6, background: "#0B0E18", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: 14 }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{p.qty}</span>
                      <button onClick={() => changerQty(p.id, 1)} style={{ width: 26, height: 26, borderRadius: 6, background: "#0B0E18", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: 14 }}>+</button>
                      <span onClick={() => retirerDuPanier(p.id)} style={{ cursor: "pointer", color: "rgba(255,100,100,0.7)", fontSize: 16, marginLeft: 4 }}>🗑</span>
                    </div>
                  </div>
                ))}
            </div>
            {panier.length > 0 && (
              <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>Total</span>
                  <span style={{ fontFamily: "Syne", fontSize: "1.2rem", fontWeight: 800, color: "#00A86B" }}>{total.toLocaleString()} FCFA</span>
                </div>
                <button onClick={() => { setShowPanier(false); setShowCommande(true); }} className="bg" style={{ width: "100%", padding: "13px 0", background: "#00A86B", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans" }}>Commander →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMMANDE */}
      {showCommande && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#161926", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 500, animation: "pi 0.3s ease", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "1.2rem", fontWeight: 700 }}>📦 Passer commande</h2>
              <span onClick={() => setShowCommande(false)} style={{ cursor: "pointer", fontSize: 22, color: "rgba(255,255,255,0.4)" }}>×</span>
            </div>
            <div style={{ background: "#1C2035", borderRadius: 12, padding: "12px 16px", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{nbPanier} article(s)</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "Syne", fontSize: "1.1rem", fontWeight: 800, color: "#00A86B" }}>{total.toLocaleString()} FCFA</div>
                {codePromoValide && <div style={{ fontSize: 13, color: "#F5C842" }}>-{reductionPromo.toLocaleString()} FCFA 🎟️</div>}
              </div>
              {codePromoValide && <div style={{ fontFamily: "Syne", fontSize: "1.2rem", fontWeight: 800, color: "#00A86B", marginTop: 4 }}>Total final : {totalFinal.toLocaleString()} FCFA</div>}
            </div>

            {[["nom", "Nom complet", "Ex: Jean Dupont", "text"], ["email", "Email (pour le reçu)", "exemple@gmail.com", "email"], ["telephoneLivreur", "📱 Téléphone pour le livreur", "+229 97 00 00 00", "tel"], ["ville", "Ville de livraison", "Cotonou, Porto-Novo…", "text"], ["adresse", "Adresse précise", "Quartier, repère…", "text"]].map(([key, label, ph, type]) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>{label}</label>
                <input type={type} placeholder={ph} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inp} />
              </div>
            ))}

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>🎟️ Code promo (optionnel)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" placeholder={`Ex: ${client?.prenom?.toLowerCase() || "prenom"}10`} value={codePromoSaisi} onChange={(e) => setCodePromoSaisi(e.target.value)} style={{ ...inp, flex: 1 }} disabled={codePromoValide} />
                {!codePromoValide ? (
                  <button onClick={verifierCodePromo} style={{ padding: "10px 16px", background: "rgba(245,200,66,0.15)", border: "1px solid rgba(245,200,66,0.3)", color: "#F5C842", borderRadius: 9, fontSize: 13, cursor: "pointer", fontFamily: "DM Sans", whiteSpace: "nowrap" }}>Appliquer</button>
                ) : (
                  <span style={{ padding: "10px 16px", background: "rgba(0,168,107,0.15)", border: "1px solid rgba(0,168,107,0.3)", color: "#00A86B", borderRadius: 9, fontSize: 13, whiteSpace: "nowrap" }}>✅ -{reductionPromo.toLocaleString()} FCFA</span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 10 }}>💰 Mode de paiement</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {PAIEMENTS.map((p) => (
                  <div key={p.id} className="pay" onClick={() => setPaiementChoisi(p.id)} style={{ background: paiementChoisi === p.id ? "rgba(0,168,107,0.15)" : "#1C2035", border: `1px solid ${paiementChoisi === p.id ? "#00A86B" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "12px", textAlign: "center", fontSize: 12, cursor: "pointer", transition: "all 0.18s", fontWeight: paiementChoisi === p.id ? 600 : 400 }}>
                    <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>{p.icon}</div>
                    {p.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.2)", borderRadius: 12, padding: "1rem 1.2rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>💰 Envoyez exactement <strong style={{ color: "#00A86B", fontSize: "1.1rem" }}>{totalFinal.toLocaleString()} FCFA</strong> au :</div>
              <div style={{ fontFamily: "Syne", fontSize: "1.3rem", fontWeight: 800, color: "#F5C842", marginBottom: 4 }}>{MOMO_NUMERO}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Puis ajoutez la capture d'écran ci-dessous</div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>📸 Capture du paiement <span style={{ color: "rgba(255,80,80,0.8)" }}>*obligatoire</span></label>
              <div style={{ border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 12, padding: "1.2rem", textAlign: "center", cursor: "pointer" }} onClick={() => document.getElementById("capture-input").click()}>
                {capturePreview ? <img src={capturePreview} alt="capture" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }} /> : (
                  <div><div style={{ fontSize: "2rem", marginBottom: 6 }}>📷</div><div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Clique pour ajouter ta capture</div></div>
                )}
                <input id="capture-input" type="file" accept="image/*" onChange={handleCaptureChange} style={{ display: "none" }} />
              </div>
            </div>

            <button onClick={passerCommande} disabled={loading} className="bg" style={{ width: "100%", padding: "14px 0", background: loading ? "#555" : "#00A86B", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans" }}>
              {loading ? "Envoi…" : "✅ Confirmer la commande"}
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION */}
      {commandeOk && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#161926", borderRadius: 20, padding: "3rem 2rem", width: "100%", maxWidth: 420, textAlign: "center", animation: "pi 0.3s ease", border: "1px solid rgba(0,168,107,0.3)" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ fontFamily: "Syne", fontSize: "1.4rem", fontWeight: 800, marginBottom: "1rem", color: "#00A86B" }}>Commande confirmée !</h2>
            <div style={{ background: "#1C2035", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Numéro de commande</div>
              <div style={{ fontFamily: "Syne", fontSize: "1.4rem", fontWeight: 800, color: "#F5C842", letterSpacing: "0.05em" }}>{commandeOk.numero}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>📧 Confirmation envoyée par email</div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, marginBottom: "2rem" }}>
              Nous vérifions votre paiement et confirmons rapidement. Livraison sous <strong style={{ color: "#fff" }}>3 jours à 2 semaines</strong>.
            </p>
            <button onClick={() => setCommandeOk(null)} className="bg" style={{ padding: "12px 32px", background: "#00A86B", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans" }}>Continuer les achats</button>
          </div>
        </div>
      )}

      {/* AJOUTER PRODUIT */}
      {showAddProduct && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#161926", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 480, animation: "pi 0.3s ease", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "Syne", fontSize: "1.2rem", fontWeight: 700 }}>➕ Ajouter un produit</h2>
              <span onClick={() => setShowAddProduct(false)} style={{ cursor: "pointer", fontSize: 22, color: "rgba(255,255,255,0.4)" }}>×</span>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>📸 Photo</label>
              <div style={{ border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 12, padding: "1.5rem", textAlign: "center", cursor: "pointer" }} onClick={() => document.getElementById("photo-input").click()}>
                {imagePreview ? <img src={imagePreview} alt="preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }} /> : <div><div style={{ fontSize: "2rem", marginBottom: 8 }}>📷</div><div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Clique pour ajouter une photo</div></div>}
                <input id="photo-input" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </div>
            </div>
            {[["title", "Nom du produit", "Ex: Parfum Hugo Boss", "text"], ["price", "Prix (FCFA)", "Ex: 18500", "number"], ["location", "Ville", "Ex: Cotonou", "text"], ["description", "Description", "Décris le produit…", "text"]].map(([key, label, ph, type]) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>{label}</label>
                <input type={type} placeholder={ph} value={newProduct[key]} onChange={(e) => setNewProduct({ ...newProduct, [key]: e.target.value })} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>🚚 Plage de livraison</label>
              <select value={newProduct.plage_livraison} onChange={(e) => setNewProduct({ ...newProduct, plage_livraison: e.target.value })} style={{ ...inp, cursor: "pointer" }}>
                {PLAGES_LIVRAISON.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>Catégorie</label>
              <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} style={{ ...inp, cursor: "pointer" }}>
                {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>Emoji</label>
              <select value={newProduct.emoji} onChange={(e) => setNewProduct({ ...newProduct, emoji: e.target.value })} style={{ ...inp, cursor: "pointer" }}>
                {["🌸", "👗", "👟", "📱", "🪢", "👜", "💍", "💻", "👒", "🕶️", "⌚", "🎒"].map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>État</label>
              <select value={newProduct.etat} onChange={(e) => setNewProduct({ ...newProduct, etat: e.target.value })} style={{ ...inp, cursor: "pointer" }}>
                {["Neuf", "Comme neuf", "Bon état", "Usagé"].map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <button onClick={ajouterProduit} disabled={loading} className="bg" style={{ width: "100%", padding: "14px 0", background: loading ? "#555" : "#00A86B", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Sans" }}>
              {loading ? "Ajout…" : "✅ Ajouter le produit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}