"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const CATEGORIES = ["Tous", "Vêtements", "Chaussures", "Parfums", "Téléphones", "Sacs", "Bijoux", "Ordinateurs", "Accessoires"];
const ADMIN_PWD = "N-beat3140";
const SUPPORT_EMAIL = "nahofalgbadamassi@gmail.com";
const SUPPORT_WA = "33775958442";
const MOMO = "+229 57577895";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f8f9fa; color: #1a1a2e; }
  .btn-primary { background: #2563eb; color: #fff; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
  .btn-secondary { background: #fff; color: #2563eb; border: 1.5px solid #2563eb; border-radius: 10px; padding: 11px 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-secondary:hover { background: #eff6ff; }
  .card { background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); overflow: hidden; transition: all 0.25s; }
  .card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.12); transform: translateY(-3px); }
  input, select, textarea { width: 100%; padding: 12px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: 'Inter', sans-serif; background: #fff; color: #1a1a2e; outline: none; }
  input:focus, select:focus, textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); }
  .modal { background: #fff; border-radius: 20px; padding: 2rem; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
  .navbar { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 1px solid #f0f0f0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
`;

export default function FastBuy229() {
  const [page, setPage] = useState("boutique");
  const [produits, setProduits] = useState([]);
  const [catActive, setCatActive] = useState("Tous");
  const [search, setSearch] = useState("");
  const [panier, setPanier] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPanier, setShowPanier] = useState(false);
  const [showCommande, setShowCommande] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [showProduit, setShowProduit] = useState(null);
  const [photoChoisie, setPhotoChoisie] = useState(0);
  const [varianteCouleur, setVarianteCouleur] = useState("");
  const [varianteTaille, setVarianteTaille] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showInscription, setShowInscription] = useState(false);
  const [showMdpOublie, setShowMdpOublie] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [produitNegocie, setProduitNegocie] = useState(null);
  const [messageTexte, setMessageTexte] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [adminOk, setAdminOk] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [adminTentatives, setAdminTentatives] = useState(0);
  const [adminBloque, setAdminBloque] = useState(false);
  const [adminBloqueTimer, setAdminBloqueTimer] = useState(0);
  const [showAdminForgot, setShowAdminForgot] = useState(false);
  const [adminForgotAncien, setAdminForgotAncien] = useState("");
  const [adminForgotNouv, setAdminForgotNouv] = useState("");
  const [adminForgotConfirm, setAdminForgotConfirm] = useState("");
  const [adminForgotError, setAdminForgotError] = useState("");
  const [adminMotDePasse, setAdminMotDePasse] = useState(ADMIN_PWD);
  const [gererClients, setGererClients] = useState(false);
  const [clientsListe, setClientsListe] = useState([]);
  const [clientRecherche, setClientRecherche] = useState("");
  const [clientTrouve, setClientTrouve] = useState(null);
  const [nouveauMdpClient, setNouveauMdpClient] = useState("");
  const [cmdSuivi, setCmdSuivi] = useState(null);
  const [codePromo, setCodePromo] = useState("");
  const [reduction, setReduction] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  const [captureFile, setCaptureFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [nouvVar, setNouvVar] = useState({ couleur: "", taille: "", prix: "", stock: "disponible" });
  const [newProduct, setNewProduct] = useState({ title: "", description: "", price: "", etat: "Neuf", category: "Vêtements", plage_livraison: "1-2 semaines" });
  const [formCmd, setFormCmd] = useState({ nom: "", email: "", telephone: "", telephoneLivreur: "", ville: "", adresse: "" });
  const [loginForm, setLoginForm] = useState({ identifiant: "", motDePasse: "" });
  const [inscForm, setInscForm] = useState({ prenom: "", nom: "", email: "", telephone: "", date_naissance: "", mot_de_passe: "", confirmer: "" });
  const [mdpForm, setMdpForm] = useState({ email: "", telephone: "", date_naissance: "", nouveau: "", confirmer: "" });
  const [authError, setAuthError] = useState("");
  const [showPwdLogin, setShowPwdLogin] = useState(false);
  const [showPwdInsc, setShowPwdInsc] = useState(false);
  const [showPwdForgot, setShowPwdForgot] = useState(false);
  const [showPwdAdmin, setShowPwdAdmin] = useState(false);

  // 🔐 STYLE BOUTON MOT DE PASSE
  const pwdButtonStyle = {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    color: "#374151",
    padding: "4px 8px",
    zIndex: 10,
    lineHeight: 1,
    transition: "all 0.2s"
  };

  useEffect(() => {
    const savedPwd = localStorage.getItem("fastbuy_admin_pwd");
    if (savedPwd) setAdminMotDePasse(savedPwd);
    const savedClient = localStorage.getItem("fastbuy_client");
    if (savedClient) setClient(JSON.parse(savedClient));
    const savedPanier = localStorage.getItem("fastbuy_panier");
    if (savedPanier) setPanier(JSON.parse(savedPanier));
    
    // ✅ DÉTECTION CORRECTE DE LA PAGE ADMIN
    if (typeof window !== "undefined" && (window.location.pathname === "/admin" || window.location.search.includes("page=admin"))) {
      setPage("admin");
    }
    
    chargerProduits();
  }, []);

  useEffect(() => {
    localStorage.setItem("fastbuy_panier", JSON.stringify(panier));
  }, [panier]);

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

  const chargerClients = async () => {
    const { data } = await supabase.from("users").select("id,nom,telephone,email,created_at").order("created_at", { ascending: false });
    if (data) setClientsListe(data);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://nuhpdqioggxznceqvpvx.supabase.co/storage/v1/object/public/produits/${path}`;
  };

  const produitsFiltres = produits.filter(p => {
    const matchCat = catActive === "Tous" || p.category === catActive;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPanier = panier.reduce((s, i) => s + i.price * i.qty, 0);
  const totalFinal = Math.round(totalPanier * (1 - reduction / 100));

  const ajouterAuPanier = (prod, couleur, taille) => {
    if (!client) { setShowLogin(true); return; }
    const key = `${prod.id}-${couleur||""}-${taille||""}`;
    setPanier(prev => {
      const ex = prev.find(i => i.key === key);
      if (ex) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...prod, key, qty: 1, couleurChoisie: couleur, tailleChoisie: taille }];
    });
    setShowProduit(null);
    setShowPanier(true);
  };

  const inscrire = async () => {
    setAuthError("");
    const { prenom, nom, email, telephone, date_naissance, mot_de_passe, confirmer } = inscForm;
    if (!prenom || !nom || !email || !telephone || !date_naissance || !mot_de_passe) { setAuthError("Remplis tous les champs !"); return; }
    if (mot_de_passe !== confirmer) { setAuthError("Les mots de passe ne correspondent pas !"); return; }
    if (mot_de_passe.length < 8) { setAuthError("Mot de passe trop court (8 min) !"); return; }
    if (!/[a-zA-Z]/.test(mot_de_passe) || !/[0-9]/.test(mot_de_passe)) { setAuthError("Le mot de passe doit contenir des lettres ET des chiffres !"); return; }
    const { data: exist } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (exist) { setAuthError("Cet email est déjà utilisé !"); return; }
    const { data, error } = await supabase.from("users").insert([{ nom: `${prenom} ${nom}`, email, telephone, date_naissance, mot_de_passe }]).select().single();
    if (error) { setAuthError("Erreur lors de l'inscription !"); return; }
    const user = { id: data.id, nom: data.nom, email: data.email, telephone: data.telephone };
    setClient(user);
    localStorage.setItem("fastbuy_client", JSON.stringify(user));
    setShowInscription(false);
  };

  const connecter = async () => {
    setAuthError("");
    const { identifiant, motDePasse } = loginForm;
    if (!identifiant || !motDePasse) { setAuthError("Remplis tous les champs !"); return; }
    const { data } = await supabase.from("users").select("*").or(`email.eq.${identifiant},telephone.eq.${identifiant}`).maybeSingle();
    if (!data || data.mot_de_passe !== motDePasse) { setAuthError("Identifiant ou mot de passe incorrect !"); return; }
    const user = { id: data.id, nom: data.nom, email: data.email, telephone: data.telephone };
    setClient(user);
    localStorage.setItem("fastbuy_client", JSON.stringify(user));
    setShowLogin(false);
  };

  const reinitMdp = async () => {
    setAuthError("");
    const { email, telephone, date_naissance, nouveau, confirmer } = mdpForm;
    if (!email || !telephone || !date_naissance || !nouveau || !confirmer) { setAuthError("Remplis tous les champs !"); return; }
    if (nouveau !== confirmer) { setAuthError("Les mots de passe ne correspondent pas !"); return; }
    const annee = parseInt(date_naissance.split("/")[2]);
    if (annee >= 2020) { setAuthError("Année de naissance invalide !"); return; }
    const { data } = await supabase.from("users").select("*").eq("email", email).eq("telephone", telephone).maybeSingle();
    if (!data) { setAuthError("Informations incorrectes !"); return; }
    const dn = data.date_naissance;
    const dnNorm = dn?.includes("-") ? dn.split("-").reverse().join("/") : dn;
    if (dnNorm !== date_naissance) { setAuthError("Date de naissance incorrecte !"); return; }
    await supabase.from("users").update({ mot_de_passe: nouveau }).eq("id", data.id);
    alert("Mot de passe réinitialisé avec succès !");
    setShowMdpOublie(false);
  };

  const envoyerCommande = async () => {
    const { nom, email, telephone, ville, adresse } = formCmd;
    if (!nom || !email || !telephone || !ville || !adresse) { alert("Remplis tous les champs !"); return; }
    if (panier.length === 0) { alert("Le panier est vide !"); return; }
    setLoading(true);
    let capturePath = null;
    if (captureFile) {
      const fn = `captures/${Date.now()}-${captureFile.name}`;
      const { error } = await supabase.storage.from("produits").upload(fn, captureFile);
      if (!error) capturePath = fn;
    }
    const num = "CMD-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    await supabase.from("commandes").insert([{
      numero: num, nom, email, telephone,
      telephoneLivreur: formCmd.telephoneLivreur,
      ville, adresse,
      articles: JSON.stringify(panier),
      total: totalPanier, totalFinal,
      reduction, codePromo,
      statut: "En attente", paiement: "En attente",
      capture: capturePath,
      user_id: client?.id
    }]);
    setShowConfirm({ numero: num, nom, totalFinal });
    setPanier([]);
    setShowCommande(false);
    setLoading(false);
    setCaptureFile(null);
  };

  const ajouterProduit = async () => {
    if (!newProduct.title || !newProduct.plage_livraison) { alert("Remplis le titre !"); return; }
    setLoading(true);
    let imagePaths = [];
    for (const file of imageFiles) {
      const fn = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("produits").upload(fn, file);
      if (!error) imagePaths.push(fn);
    }
    const prixBase = variantes.length > 0 ? Math.min(...variantes.map(v => parseInt(v.prix) || 0)) : parseInt(newProduct.price) || 0;
    await supabase.from("produits").insert([{
      ...newProduct,
      emoji: "📦",
      price: prixBase,
      location: "Bénin",
      image: imagePaths[0] || null,
      images: imagePaths.length > 0 ? imagePaths : null,
      variantes: variantes.length > 0 ? variantes : null
    }]);
    await chargerProduits();
    setShowAddProduct(false);
    setNewProduct({ title: "", description: "", price: "", etat: "Neuf", category: "Vêtements", plage_livraison: "1-2 semaines" });
    setImageFiles([]); setImagePreviews([]);
    setVariantes([]); setNouvVar({ couleur: "", taille: "", prix: "", stock: "disponible" });
    setLoading(false);
  };

  const supprimerProduit = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await supabase.from("produits").delete().eq("id", id);
    await chargerProduits();
  };

  const appliquerPromo = () => {
    if (!client) { setPromoMsg("Connecte-toi d'abord !"); return; }
    const prenom = client.nom?.split(" ")[0]?.toLowerCase();
    if (codePromo.toLowerCase() === `${prenom}10`) {
      setReduction(10); setPromoMsg("✅ Code promo appliqué ! -10%");
    } else {
      setReduction(0); setPromoMsg("❌ Code invalide !");
    }
  };

  const formatDate = (val, setter, field) => {
    let v = val.replace(/\D/g, "");
    if (v.length >= 3 && v.length <= 4) v = v.slice(0, 2) + "/" + v.slice(2);
    else if (v.length >= 5) v = v.slice(0, 2) + "/" + v.slice(2, 4) + "/" + v.slice(4, 8);
    setter(p => ({ ...p, [field]: v }));
  };

  const inp = { width: "100%", padding: "12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontFamily: "'Inter', sans-serif", background: "#fff", color: "#1a1a2e", outline: "none", marginBottom: 12 };

  // ===================== ADMIN PAGE =====================
  if (page === "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', sans-serif" }}>
        <style>{globalStyles}</style>
        {!adminOk ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem" }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem", width: "100%", maxWidth: 400, boxShadow: "0 4px 30px rgba(0,0,0,0.1)" }}>
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔐</div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 800, color: "#1a1a2e" }}>FastBuy 229</h1>
                <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>Espace Administration</p>
              </div>
              {adminBloque ? (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "1rem", textAlign: "center", color: "#ef4444", fontSize: 14 }}>
                  🔒 Trop de tentatives ! Réessaie dans <strong>{adminBloqueTimer}s</strong>
                </div>
              ) : (
                <>
                  {adminTentatives > 0 && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 12 }}>⚠️ Tentative {adminTentatives}/3</div>}
                  {!showAdminForgot ? (
                    <>
                      <div style={{ position: "relative", marginBottom: 12 }}>
                        <input 
                          type={showPwdAdmin ? "text" : "password"} 
                          value={adminPwd} 
                          onChange={e => setAdminPwd(e.target.value)} 
                          placeholder="Mot de passe" 
                          style={{ ...inp, marginBottom: 0, paddingRight: 40 }} 
                          onKeyDown={e => e.key === "Enter" && (() => {
                            if (adminPwd === adminMotDePasse) { setAdminOk(true); setAdminTentatives(0); chargerCommandes(); chargerMessages(); }
                            else {
                              const n = adminTentatives + 1; setAdminTentatives(n); setAdminPwd("");
                              if (n >= 3) { setAdminBloque(true); let t = 300; setAdminBloqueTimer(t); const iv = setInterval(() => { t--; setAdminBloqueTimer(t); if (t <= 0) { clearInterval(iv); setAdminBloque(false); setAdminTentatives(0); } }, 1000); }
                            }
                          })()} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwdAdmin(p => !p)}
                          style={pwdButtonStyle}
                          title={showPwdAdmin ? "Masquer" : "Afficher"}
                        >
                          {showPwdAdmin ? "🙈" : "👁️"}
                        </button>
                      </div>
                      <button className="btn-primary" style={{ width: "100%" }} onClick={() => {
                        if (adminPwd === adminMotDePasse) { setAdminOk(true); setAdminTentatives(0); chargerCommandes(); chargerMessages(); }
                        else {
                          const n = adminTentatives + 1; setAdminTentatives(n); setAdminPwd("");
                          if (n >= 3) { setAdminBloque(true); let t = 300; setAdminBloqueTimer(t); const iv = setInterval(() => { t--; setAdminBloqueTimer(t); if (t <= 0) { clearInterval(iv); setAdminBloque(false); setAdminTentatives(0); } }, 1000); }
                        }
                      }}>Accéder</button>
                      <button onClick={() => setShowAdminForgot(true)} style={{ background: "none", border: "none", color: "#2563eb", fontSize: 13, cursor: "pointer", width: "100%", marginTop: 12 }}>Modifier mon mot de passe</button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>Changer le mot de passe admin</p>
                      <input type="password" value={adminForgotAncien} onChange={e => setAdminForgotAncien(e.target.value)} placeholder="Ancien mot de passe" style={inp} />
                      <input type="password" value={adminForgotNouv} onChange={e => setAdminForgotNouv(e.target.value)} placeholder="Nouveau mot de passe" style={inp} />
                      <input type="password" value={adminForgotConfirm} onChange={e => setAdminForgotConfirm(e.target.value)} placeholder="Confirmer" style={inp} />
                      {adminForgotError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{adminForgotError}</div>}
                      <button className="btn-primary" style={{ width: "100%", marginBottom: 8 }} onClick={() => {
                        if (!adminForgotAncien || !adminForgotNouv || !adminForgotConfirm) { setAdminForgotError("Remplis tous les champs !"); return; }
                        if (adminForgotAncien !== adminMotDePasse) { setAdminForgotError("Ancien mot de passe incorrect !"); return; }
                        if (adminForgotNouv.length < 6) { setAdminForgotError("Trop court !"); return; }
                        if (adminForgotNouv !== adminForgotConfirm) { setAdminForgotError("Ne correspondent pas !"); return; }
                        setAdminMotDePasse(adminForgotNouv); localStorage.setItem("fastbuy_admin_pwd", adminForgotNouv);
                        alert("Mot de passe changé !"); setShowAdminForgot(false);
                      }}>Valider</button>
                      <button onClick={() => setShowAdminForgot(false)} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer", width: "100%" }}>← Retour</button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 800, color: "#1a1a2e" }}>⚙️ FastBuy 229 — Admin</h1>
                <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{produits.length} produits · {commandes.length} commandes</p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={() => setShowAddProduct(true)}>+ Ajouter produit</button>
                <button className="btn-secondary" onClick={() => { setGererClients(true); chargerClients(); }}>Gérer clients</button>
                <button onClick={() => { setAdminOk(false); setAdminPwd(""); }} style={{ padding: "10px 18px", background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>Déconnexion</button>
              </div>
            </div>

            {/* Commandes */}
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "#1a1a2e" }}>📦 Commandes récentes</h2>
            {commandes.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", textAlign: "center", color: "#9ca3af", marginBottom: "2rem" }}>Aucune commande</div>
            ) : (
              <div style={{ display: "grid", gap: 12, marginBottom: "2rem" }}>
                {commandes.map(cmd => (
                  <div key={cmd.id} style={{ background: "#fff", borderRadius: 14, padding: "1.2rem 1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{cmd.numero} — {cmd.nom}</div>
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{cmd.telephone} · {cmd.ville}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{new Date(cmd.created_at).toLocaleDateString("fr-FR")}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#2563eb" }}>{cmd.totalFinal?.toLocaleString()} FCFA</div>
                        <select value={cmd.statut} onChange={async e => {
                          await supabase.from("commandes").update({ statut: e.target.value }).eq("id", cmd.id);
                          chargerCommandes();
                        }} style={{ marginTop: 6, padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12, cursor: "pointer" }}>
                          <option>En attente</option>
                          <option>Confirmé</option>
                          <option>Expédié</option>
                          <option>Livré</option>
                          <option>Annulé</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Messages */}
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "#1a1a2e" }}>💬 Messages clients</h2>
            {messages.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", textAlign: "center", color: "#9ca3af", marginBottom: "2rem" }}>Aucun message</div>
            ) : (
              <div style={{ display: "grid", gap: 12, marginBottom: "2rem" }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ background: "#fff", borderRadius: 14, padding: "1.2rem 1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{msg.nom} — {msg.telephone}</div>
                    <div style={{ fontSize: 13, color: "#374151", marginTop: 6, background: "#f9fafb", padding: "10px 14px", borderRadius: 8 }}>{msg.message}</div>
                    <textarea placeholder="Répondre..." value={msg.reponse || ""} onChange={async e => {
                      await supabase.from("messages").update({ reponse: e.target.value }).eq("id", msg.id);
                      chargerMessages();
                    }} style={{ marginTop: 8, padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, width: "100%", fontSize: 13, resize: "vertical" }} rows={2} />
                  </div>
                ))}
              </div>
            )}

            {/* Produits */}
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "#1a1a2e" }}>🛍️ Produits ({produits.length})</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {produits.map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ height: 120, background: "#f3f4f6", overflow: "hidden" }}>
                    {(p.images?.[0] || p.image) ? <img src={getImageUrl(p.images?.[0] || p.image)} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>📦</div>}
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{p.price?.toLocaleString()} FCFA</div>
                    <button onClick={() => supprimerProduit(p.id)} style={{ width: "100%", padding: "7px 0", background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal ajouter produit */}
        {showAddProduct && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddProduct(false)}>
            <div className="modal" style={{ maxWidth: 560 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Ajouter un produit</h2>
              <input value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} placeholder="Nom du produit" style={inp} />
              <textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Description" style={{ ...inp, resize: "vertical" }} rows={3} />
              <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={inp}>
                {CATEGORIES.filter(c => c !== "Tous").map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Prix (FCFA)" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} style={inp} />
              <button onClick={ajouterProduit} disabled={loading} className="btn-primary" style={{ width: "100%" }}>
                {loading ? "Ajout..." : "✅ Publier"}
              </button>
            </div>
          </div>
        )}

        {/* Modal gérer clients */}
        {gererClients && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setGererClients(false)}>
            <div className="modal">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Gérer les clients</h2>
              <input placeholder="Rechercher par email..." value={clientRecherche} onChange={e => setClientRecherche(e.target.value)} style={inp} />
              <button className="btn-primary" style={{ width: "100%", marginBottom: 16 }} onClick={async () => {
                const { data } = await supabase.from("users").select("*").eq("email", clientRecherche).maybeSingle();
                setClientTrouve(data || null);
              }}>Rechercher</button>
              {clientTrouve && (
                <div style={{ background: "#f9fafb", borderRadius: 12, padding: "1rem", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{clientTrouve.nom}</div>
                  <input type="password" placeholder="Nouveau mot de passe" value={nouveauMdpClient} onChange={e => setNouveauMdpClient(e.target.value)} style={inp} />
                  <button className="btn-primary" style={{ width: "100%", marginBottom: 8 }} onClick={async () => {
                    if (nouveauMdpClient.length < 8) { alert("Trop court !"); return; }
                    await supabase.from("users").update({ mot_de_passe: nouveauMdpClient }).eq("id", clientTrouve.id);
                    alert("Mis à jour !"); setNouveauMdpClient(""); setClientTrouve(null);
                  }}>Changer</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===================== BOUTIQUE =====================
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div onClick={() => setPage("boutique")} style={{ cursor: "pointer" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 800, color: "#1a1a2e" }}>FastBuy</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 800, color: "#2563eb" }}>229</span>
          </div>

          <div style={{ flex: 1, maxWidth: 400, margin: "0 2rem" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ ...inp, marginBottom: 0, background: "#f3f4f6", border: "1.5px solid #e5e7eb", borderRadius: 25, padding: "10px 18px", fontSize: 13 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setPage("aide")} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer" }}>Aide</button>
            {client ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setPage("suivi")} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer" }}>Mes commandes</button>
                <button onClick={() => { setClient(null); localStorage.removeItem("fastbuy_client"); }} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer" }}>Déconnexion</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => { setShowLogin(true); setAuthError(""); }}>Connexion</button>
                <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => { setShowInscription(true); setAuthError(""); }}>S'inscrire</button>
              </div>
            )}
            <button onClick={() => setShowPanier(true)} style={{ background: "#eff6ff", border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#2563eb" }}>
              🛒 {panier.reduce((s, i) => s + i.qty, 0)}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      {page === "boutique" && (
        <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2563eb 100%)", padding: "3rem 1.5rem", textAlign: "center", color: "#fff" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 800, marginBottom: 12 }}>FastBuy 229</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", maxWidth: 500, margin: "0 auto 1.5rem" }}>La meilleure boutique en ligne du Bénin.</p>
          {!client && <button className="btn-primary" style={{ background: "#f59e0b", border: "none", padding: "12px 32px", fontSize: 15 }} onClick={() => setShowInscription(true)}>Créer mon compte</button>}
        </div>
      )}

      {/* BOUTIQUE GRILLE */}
      {page === "boutique" && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: "1.5rem", paddingBottom: 4 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCatActive(cat)} style={{ padding: "8px 18px", borderRadius: 25, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", border: "1.5px solid", background: catActive === cat ? "#2563eb" : "#fff", color: catActive === cat ? "#fff" : "#6b7280", borderColor: catActive === cat ? "#2563eb" : "#e5e7eb" }}>
                {cat}
              </button>
            ))}
          </div>

          {produitsFiltres.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#9ca3af" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
              <div>Aucun produit trouvé</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
              {produitsFiltres.map(item => (
                <div key={item.id} className="card" onClick={() => { setShowProduit(item); setPhotoChoisie(0); setVarianteCouleur(""); setVarianteTaille(""); }} style={{ cursor: "pointer" }}>
                  <div style={{ height: 200, background: "#f3f4f6", overflow: "hidden" }}>
                    {(item.images?.[0] || item.image) ? (
                      <img src={getImageUrl(item.images?.[0] || item.image)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>📦</div>
                    )}
                  </div>
                  <div style={{ padding: "14px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>{item.category}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#2563eb" }}>
                      {item.price?.toLocaleString()} FCFA
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL LOGIN */}
      {showLogin && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLogin(false)}>
          <div className="modal">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Connexion</h2>
            <input placeholder="Email ou téléphone" value={loginForm.identifiant} onChange={e => setLoginForm({ ...loginForm, identifiant: e.target.value })} style={inp} />
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input 
                type={showPwdLogin ? "text" : "password"} 
                placeholder="Mot de passe" 
                value={loginForm.motDePasse} 
                onChange={e => setLoginForm({ ...loginForm, motDePasse: e.target.value })} 
                style={{ ...inp, marginBottom: 0, paddingRight: 40 }} 
              />
              <button
                type="button"
                onClick={() => setShowPwdLogin(p => !p)}
                style={pwdButtonStyle}
                title={showPwdLogin ? "Masquer" : "Afficher"}
              >
                {showPwdLogin ? "🙈" : "👁️"}
              </button>
            </div>
            {authError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{authError}</div>}
            <button className="btn-primary" style={{ width: "100%", marginBottom: 12 }} onClick={connecter}>Se connecter</button>
            <div style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
              <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => { setShowLogin(false); setShowMdpOublie(true); setAuthError(""); }}>Mot de passe oublié ?</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSCRIPTION */}
      {showInscription && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowInscription(false)}>
          <div className="modal">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Créer un compte</h2>
            <input placeholder="Prénom *" value={inscForm.prenom} onChange={e => setInscForm({ ...inscForm, prenom: e.target.value })} style={inp} />
            <input placeholder="Nom *" value={inscForm.nom} onChange={e => setInscForm({ ...inscForm, nom: e.target.value })} style={inp} />
            <input placeholder="Email *" type="email" value={inscForm.email} onChange={e => setInscForm({ ...inscForm, email: e.target.value })} style={inp} />
            <input placeholder="Téléphone *" value={inscForm.telephone} onChange={e => setInscForm({ ...inscForm, telephone: e.target.value })} style={inp} />
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input 
                type={showPwdInsc ? "text" : "password"} 
                placeholder="Mot de passe *" 
                value={inscForm.mot_de_passe} 
                onChange={e => setInscForm({ ...inscForm, mot_de_passe: e.target.value })} 
                style={{ ...inp, marginBottom: 0, paddingRight: 40 }} 
              />
              <button
                type="button"
                onClick={() => setShowPwdInsc(p => !p)}
                style={pwdButtonStyle}
                title={showPwdInsc ? "Masquer" : "Afficher"}
              >
                {showPwdInsc ? "🙈" : "👁️"}
              </button>
            </div>
            <button className="btn-primary" style={{ width: "100%", marginBottom: 12 }} onClick={inscrire}>Créer mon compte</button>
          </div>
        </div>
      )}

      {/* MODAL MOT DE PASSE OUBLIÉ */}
      {showMdpOublie && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMdpOublie(false)}>
          <div className="modal">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Mot de passe oublié</h2>
            <input placeholder="Email *" value={mdpForm.email} onChange={e => setMdpForm({ ...mdpForm, email: e.target.value })} style={inp} />
            <input placeholder="Téléphone *" value={mdpForm.telephone} onChange={e => setMdpForm({ ...mdpForm, telephone: e.target.value })} style={inp} />
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input 
                type={showPwdForgot ? "text" : "password"} 
                placeholder="Nouveau mot de passe *" 
                value={mdpForm.nouveau} 
                onChange={e => setMdpForm({ ...mdpForm, nouveau: e.target.value })} 
                style={{ ...inp, marginBottom: 0, paddingRight: 40 }} 
              />
              <button
                type="button"
                onClick={() => setShowPwdForgot(p => !p)}
                style={pwdButtonStyle}
                title={showPwdForgot ? "Masquer" : "Afficher"}
              >
                {showPwdForgot ? "🙈" : "👁️"}
              </button>
            </div>
            <button className="btn-primary" style={{ width: "100%", marginBottom: 16 }} onClick={reinitMdp}>Réinitialiser</button>
          </div>
        </div>
      )}
    </div>
  );
}