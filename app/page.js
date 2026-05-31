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
  .btn-primary:hover { background: #1d4ed8; }
  .btn-secondary { background: #fff; color: #2563eb; border: 1.5px solid #2563eb; border-radius: 10px; padding: 11px 24px; font-size: 14px; font-weight: 600; cursor: pointer; }
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
  const [couleurChoisie, setCouleurChoisie] = useState("");
  const [tailleChoisie, setTailleChoisie] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showInscription, setShowInscription] = useState(false);
  const [showMdpOublie, setShowMdpOublie] = useState(false);
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
  const [nouvVar, setNouvVar] = useState({ couleur: "", taille: "", prix: "", stock: "disponible", quantite: "" });
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
    lineHeight: 1
  };

  useEffect(() => {
    const savedPwd = localStorage.getItem("fastbuy_admin_pwd");
    if (savedPwd) setAdminMotDePasse(savedPwd);
    const savedClient = localStorage.getItem("fastbuy_client");
    if (savedClient) setClient(JSON.parse(savedClient));
    const savedPanier = localStorage.getItem("fastbuy_panier");
    if (savedPanier) setPanier(JSON.parse(savedPanier));
    
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

  const ajouterAuPanier = (prod, couleur = "", taille = "") => {
    if (!client) { setShowLogin(true); return; }
    const key = `${prod.id}-${couleur}-${taille}`;
    // Récupérer le prix correct selon la variante
    let prixChoisi = prod.price;
    if (prod.variantes && couleur && taille) {
      try {
        const vars = typeof prod.variantes === "string" ? JSON.parse(prod.variantes) : prod.variantes;
        const varTrouvee = vars.find(v => v.couleur === couleur && v.taille === taille);
        if (varTrouvee) prixChoisi = parseInt(varTrouvee.prix);
      } catch (e) {}
    }
    setPanier(prev => {
      const ex = prev.find(i => i.key === key);
      if (ex) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...prod, key, qty: 1, couleurChoisie: couleur, tailleChoisie: taille, price: prixChoisi }];
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
    if (!/[a-zA-Z]/.test(mot_de_passe) || !/[0-9]/.test(mot_de_passe)) { setAuthError("Lettres ET chiffres requis !"); return; }
    const { data: exist } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (exist) { setAuthError("Email déjà utilisé !"); return; }
    const { data, error } = await supabase.from("users").insert([{ nom: `${prenom} ${nom}`, email, telephone, date_naissance, mot_de_passe }]).select().single();
    if (error) { setAuthError("Erreur inscription !"); return; }
    const user = { id: data.id, nom: data.nom, email: data.email, telephone: data.telephone };
    setClient(user);
    localStorage.setItem("fastbuy_client", JSON.stringify(user));
    setShowInscription(false);
  };

  const connecter = async () => {
    setAuthError("");
    const { identifiant, motDePasse } = loginForm;
    if (!identifiant || !motDePasse) { setAuthError("Remplis tous les champs !"); return; }
    
    // Chercher par email d'abord
    let { data } = await supabase.from("users").select("*").eq("email", identifiant).maybeSingle();
    
    // Si pas trouvé par email, chercher par téléphone
    if (!data) {
      ({ data } = await supabase.from("users").select("*").eq("telephone", identifiant).maybeSingle());
    }
    
    // Si toujours pas trouvé → compte n'existe pas
    if (!data) { 
      setAuthError("❌ Compte non trouvé. Tu dois d'abord t'inscrire !"); 
      return; 
    }
    
    // Si trouvé mais MDP incorrect
    if (data.mot_de_passe !== motDePasse) { 
      setAuthError("❌ Mot de passe incorrect !"); 
      return; 
    }
    
    // Connexion réussie
    const user = { id: data.id, nom: data.nom, email: data.email, telephone: data.telephone };
    setClient(user);
    localStorage.setItem("fastbuy_client", JSON.stringify(user));
    setShowLogin(false);
    setLoginForm({ identifiant: "", motDePasse: "" });
  };

  const reinitMdp = async () => {
    setAuthError("");
    const { email, telephone, date_naissance, nouveau, confirmer } = mdpForm;
    if (!email || !telephone || !date_naissance || !nouveau || !confirmer) { setAuthError("Remplis tous les champs !"); return; }
    if (nouveau !== confirmer) { setAuthError("Les mots de passe ne correspondent pas !"); return; }
    const annee = parseInt(date_naissance.split("/")[2]);
    if (annee >= 2020) { setAuthError("Année invalide !"); return; }
    const { data } = await supabase.from("users").select("*").eq("email", email).eq("telephone", telephone).maybeSingle();
    if (!data) { setAuthError("Infos incorrectes !"); return; }
    const dn = data.date_naissance;
    const dnNorm = dn?.includes("-") ? dn.split("-").reverse().join("/") : dn;
    if (dnNorm !== date_naissance) { setAuthError("Date naissance incorrecte !"); return; }
    try {
      const { error } = await supabase.from("users").update({ mot_de_passe: nouveau }).eq("id", data.id);
      if (error) { setAuthError("Erreur: " + error.message); return; }
      alert("✅ Mot de passe réinitialisé ! Tu peux te connecter.");
      setShowMdpOublie(false);
      setMdpForm({ email: "", telephone: "", date_naissance: "", nouveau: "", confirmer: "" });
    } catch (e) {
      setAuthError("Erreur: " + e.message);
    }
  };

  const envoyerCommande = async () => {
    const { nom, email, telephone, ville, adresse } = formCmd;
    if (!nom || !email || !telephone || !ville || !adresse) { alert("Remplis tous les champs !"); return; }
    if (panier.length === 0) { alert("Panier vide !"); return; }
    if (!captureFile) { alert("Capture obligatoire !"); return; }
    setLoading(true);
    let capturePath = null;
    const fn = `captures/${Date.now()}-${captureFile.name}`;
    const { error } = await supabase.storage.from("produits").upload(fn, captureFile);
    if (!error) capturePath = fn;
    const num = "CMD-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    await supabase.from("commandes").insert([{
      numero: num, nom, email, telephone, telephoneLivreur: formCmd.telephoneLivreur,
      ville, adresse, articles: JSON.stringify(panier),
      total: totalPanier, totalFinal, reduction, codePromo,
      statut: "En attente", paiement: "En attente", capture: capturePath, user_id: client?.id
    }]);
    setShowConfirm({ numero: num, nom, totalFinal });
    setPanier([]);
    setShowCommande(false);
    setLoading(false);
    setCaptureFile(null);
  };

  const ajouterProduit = async () => {
    if (!newProduct.title) { alert("Titre obligatoire !"); return; }
    if (variantes.length === 0) { alert("Ajoute au moins une variante (Couleur + Taille) !"); return; }
    setLoading(true);
    let imagePaths = [];
    for (const file of imageFiles) {
      const fn = `${Date.now()}-${Math.random()}.jpg`;
      await supabase.storage.from("produits").upload(fn, file);
      imagePaths.push(fn);
    }
    // Le prix est le minimum des variantes
    const prixBase = Math.min(...variantes.map(v => parseInt(v.prix) || 0));
    
    await supabase.from("produits").insert([{
      ...newProduct, 
      price: prixBase, 
      image: imagePaths[0] || null, 
      images: imagePaths,
      variantes: JSON.stringify(variantes.map(({ id, ...v }) => v))
    }]);
    await chargerProduits();
    setShowAddProduct(false);
    setNewProduct({ title: "", description: "", price: "", etat: "Neuf", category: "Vêtements", plage_livraison: "1-2 semaines" });
    setImageFiles([]); setImagePreviews([]);
    setVariantes([]);
    setNouvVar({ couleur: "", taille: "", prix: "", stock: "disponible", quantite: "" });
    setLoading(false);
  };

  const supprimerProduit = async (id) => {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("produits").delete().eq("id", id);
    await chargerProduits();
  };

  const appliquerPromo = () => {
    if (!client) { setPromoMsg("Connecte-toi !"); return; }
    const prenom = client.nom?.split(" ")[0]?.toLowerCase();
    if (codePromo.toLowerCase() === `${prenom}10`) {
      setReduction(10); setPromoMsg("✅ -10% appliqué !");
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
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 800 }}>FastBuy 229</h1>
                <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>Admin</p>
              </div>
              {adminBloque ? (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "1rem", textAlign: "center", color: "#ef4444", fontSize: 14 }}>
                  🔒 Bloqué {adminBloqueTimer}s
                </div>
              ) : (
                <>
                  {adminTentatives > 0 && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 12 }}>⚠️ {adminTentatives}/3</div>}
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
                    </>
                  ) : (
                    <>
                      <input type="password" value={adminForgotAncien} onChange={e => setAdminForgotAncien(e.target.value)} placeholder="Ancien" style={inp} />
                      <input type="password" value={adminForgotNouv} onChange={e => setAdminForgotNouv(e.target.value)} placeholder="Nouveau" style={inp} />
                      <input type="password" value={adminForgotConfirm} onChange={e => setAdminForgotConfirm(e.target.value)} placeholder="Confirmer" style={inp} />
                      <button className="btn-primary" style={{ width: "100%" }} onClick={() => {
                        if (adminForgotAncien !== adminMotDePasse) { alert("Ancien incorrect !"); return; }
                        if (adminForgotNouv.length < 6) { alert("Trop court !"); return; }
                        if (adminForgotNouv !== adminForgotConfirm) { alert("Ne correspondent pas !"); return; }
                        setAdminMotDePasse(adminForgotNouv); localStorage.setItem("fastbuy_admin_pwd", adminForgotNouv);
                        alert("Changé !"); setShowAdminForgot(false);
                      }}>Valider</button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: 12 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 800 }}>⚙️ Admin</h1>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={() => setShowAddProduct(true)}>+ Produit</button>
                <button className="btn-secondary" onClick={() => setGererClients(true)}>Clients</button>
                <button onClick={() => { setAdminOk(false); setAdminPwd(""); }} style={{ padding: "10px 18px", background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>Déco</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: "2rem" }}>
              {[
                { label: "Commandes", val: commandes.length, icon: "📦", color: "#2563eb" },
                { label: "Total", val: commandes.reduce((a, c) => a + (c.totalFinal || 0), 0).toLocaleString() + " FCFA", icon: "💰", color: "#16a34a" },
                { label: "Produits", val: produits.length, icon: "🛍️", color: "#f59e0b" },
                { label: "Messages", val: messages.length, icon: "💬", color: "#a855f7" }
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "1.2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>{s.label}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: s.color, marginTop: 6 }}>{s.val}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>📦 Commandes</h2>
            <div style={{ display: "grid", gap: 12, marginBottom: "2rem" }}>
              {commandes.length === 0 ? (
                <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", textAlign: "center", color: "#9ca3af" }}>Aucune</div>
              ) : (
                commandes.map(cmd => (
                  <div key={cmd.id} style={{ background: "#fff", borderRadius: 14, padding: "1.2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{cmd.numero} — {cmd.nom}</div>
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{cmd.telephone} · {cmd.ville}</div>
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
                ))
              )}
            </div>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>💬 Messages</h2>
            <div style={{ display: "grid", gap: 12, marginBottom: "2rem" }}>
              {messages.length === 0 ? (
                <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", textAlign: "center", color: "#9ca3af" }}>Aucun</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} style={{ background: "#fff", borderRadius: 14, padding: "1.2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{msg.nom} — {msg.telephone}</div>
                    <div style={{ fontSize: 13, color: "#374151", marginTop: 6, background: "#f9fafb", padding: "10px", borderRadius: 6 }}>{msg.message}</div>
                    <textarea placeholder="Répondre..." value={msg.reponse || ""} onChange={async e => {
                      await supabase.from("messages").update({ reponse: e.target.value }).eq("id", msg.id);
                      chargerMessages();
                    }} style={{ marginTop: 8, padding: "10px", border: "1px solid #e5e7eb", borderRadius: 6, width: "100%", fontSize: 13, fontFamily: "'Inter', sans-serif", resize: "vertical" }} rows={2} />
                  </div>
                ))
              )}
            </div>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>🛍️ Produits</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
              {produits.map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ height: 90, background: "#f3f4f6", overflow: "hidden" }}>
                    {(p.images?.[0] || p.image) ? <img src={getImageUrl(p.images?.[0] || p.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div>📦</div>}
                  </div>
                  <div style={{ padding: "8px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{p.title?.slice(0, 15)}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{p.price?.toLocaleString()}</div>
                    <button onClick={() => supprimerProduit(p.id)} style={{ width: "100%", padding: "4px 0", background: "#fef2f2", border: "none", color: "#ef4444", borderRadius: 4, fontSize: 10, cursor: "pointer", marginTop: 4 }}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal ajouter produit */}
        {showAddProduct && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddProduct(false)}>
            <div className="modal" style={{ maxWidth: 600, maxHeight: "95vh", overflowY: "auto" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Ajouter produit</h2>
              
              {/* Infos de base */}
              <input value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} placeholder="Titre *" style={inp} />
              <textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Description" style={{ ...inp, resize: "vertical" }} rows={2} />
              <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={inp}>
                {CATEGORIES.filter(c => c !== "Tous").map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={newProduct.etat} onChange={e => setNewProduct({ ...newProduct, etat: e.target.value })} style={inp}>
                <option>Neuf</option>
                <option>Comme neuf</option>
                <option>Bon état</option>
              </select>
              <select value={newProduct.plage_livraison} onChange={e => setNewProduct({ ...newProduct, plage_livraison: e.target.value })} style={inp}>
                <option>1-3 jours</option>
                <option>3-5 jours</option>
                <option>1-2 semaines</option>
                <option>2-3 semaines</option>
              </select>

              {/* Photos */}
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Photos (max 5)</label>
              <div onClick={() => document.getElementById("photo-input").click()} style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "1rem", textAlign: "center", cursor: "pointer", marginBottom: 16, background: "#fafafa" }}>
                {imagePreviews.length > 0 ? (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                    {imagePreviews.map((p, i) => <img key={i} src={p} alt="" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }} />)}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>📷 Clique</div>
                )}
                <input id="photo-input" type="file" accept="image/*" multiple onChange={e => {
                  const files = Array.from(e.target.files).slice(0, 5);
                  setImageFiles(files);
                  setImagePreviews(files.map(f => URL.createObjectURL(f)));
                }} style={{ display: "none" }} />
              </div>

              {/* VARIANTES */}
              <div style={{ background: "#f0f9ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "1rem", marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: "#1e40af" }}>📦 Variantes (Couleur + Taille)</div>
                
                {/* Formulaire variante */}
                <input placeholder="Couleur (ex: Rouge, Bleu) *" value={nouvVar.couleur} onChange={e => setNouvVar({ ...nouvVar, couleur: e.target.value })} style={{ ...inp, marginBottom: 10 }} />
                <input placeholder="Taille/Volume (ex: S, M, L, XL) *" value={nouvVar.taille} onChange={e => setNouvVar({ ...nouvVar, taille: e.target.value })} style={{ ...inp, marginBottom: 10 }} />
                <input type="number" placeholder="Prix FCFA *" value={nouvVar.prix} onChange={e => setNouvVar({ ...nouvVar, prix: e.target.value })} style={{ ...inp, marginBottom: 10 }} />
                <select value={nouvVar.stock} onChange={e => setNouvVar({ ...nouvVar, stock: e.target.value })} style={{ ...inp, marginBottom: 10 }}>
                  <option value="disponible">Stock: Disponible</option>
                  <option value="rupture">Stock: Rupture</option>
                </select>
                <input type="number" placeholder="Quantité en stock" value={nouvVar.quantite} onChange={e => setNouvVar({ ...nouvVar, quantite: e.target.value })} style={inp} />
                <button onClick={() => {
                  if (!nouvVar.couleur || !nouvVar.taille || !nouvVar.prix) { alert("Couleur, Taille et Prix obligatoires !"); return; }
                  setVariantes([...variantes, { ...nouvVar, id: Date.now() }]);
                  setNouvVar({ couleur: "", taille: "", prix: "", stock: "disponible", quantite: "" });
                }} style={{ width: "100%", padding: "10px 0", background: "#dbeafe", border: "1px solid #93c5fd", color: "#1e40af", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 600, marginTop: 8 }}>
                  + Ajouter cette variante
                </button>

                {/* Liste variantes */}
                {variantes.length > 0 && (
                  <div style={{ marginTop: 12, maxHeight: 250, overflowY: "auto" }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontWeight: 500 }}>({variantes.length} variantes)</div>
                    {variantes.map(v => (
                      <div key={v.id} style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, border: "1px solid #e5e7eb" }}>
                        <span style={{ flex: 1 }}>
                          <strong>{v.couleur}</strong> • <strong>{v.taille}</strong> → <strong>{v.prix} FCFA</strong>
                        </span>
                        <button onClick={() => setVariantes(variantes.filter(vv => vv.id !== v.id))} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {variantes.length === 0 && (
                <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 10, padding: "10px 12px", marginBottom: 16, fontSize: 12, color: "#92400e" }}>
                  ⚠️ Ajoute au moins une variante (Couleur + Taille)
                </div>
              )}

              <button onClick={ajouterProduit} disabled={loading} className="btn-primary" style={{ width: "100%" }}>
                {loading ? "..." : "✅ Publier"}
              </button>
            </div>
          </div>
        )}

        {/* Modal gérer clients */}
        {gererClients && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setGererClients(false)}>
            <div className="modal">
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Gérer clients</h2>
              <input placeholder="Email" value={clientRecherche} onChange={e => setClientRecherche(e.target.value)} style={inp} />
              <button className="btn-primary" style={{ width: "100%", marginBottom: 16 }} onClick={async () => {
                const { data } = await supabase.from("users").select("*").eq("email", clientRecherche).maybeSingle();
                setClientTrouve(data || null);
              }}>Rechercher</button>
              {clientTrouve && (
                <div style={{ background: "#f9fafb", borderRadius: 12, padding: "1rem", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{clientTrouve.nom}</div>
                  <input type="password" placeholder="Nouveau MDP" value={nouveauMdpClient} onChange={e => setNouveauMdpClient(e.target.value)} style={inp} />
                  <button className="btn-primary" style={{ width: "100%", marginBottom: 8 }} onClick={async () => {
                    if (nouveauMdpClient.length < 8) { alert("Minimum 8 caractères !"); return; }
                    try {
                      const { error } = await supabase.from("users").update({ mot_de_passe: nouveauMdpClient }).eq("id", clientTrouve.id);
                      if (error) { alert("Erreur: " + error.message); return; }
                      alert("✅ Mot de passe changé !"); 
                      setNouveauMdpClient(""); 
                      setClientTrouve(null); 
                      setClientRecherche("");
                    } catch (e) {
                      alert("Erreur: " + e.message);
                    }
                  }}>Changer</button>
                  <button onClick={async () => {
                    if (!confirm(`Supprimer le compte de ${clientTrouve.nom} ?\nCette action est définitive !`)) return;
                    try {
                      const { error } = await supabase.from("users").delete().eq("id", clientTrouve.id);
                      if (error) { alert("Erreur: " + error.message); return; }
                      alert("✅ Compte supprimé définitivement !"); 
                      setClientTrouve(null); 
                      setClientRecherche("");
                    } catch (e) {
                      alert("Erreur: " + e.message);
                    }
                  }} style={{ width: "100%", padding: "10px 0", background: "#fef2f2", border: "1.5px solid #fecaca", color: "#ef4444", borderRadius: 10, fontSize: 13, cursor: "pointer", fontWeight: 500, marginTop: 8 }}>
                    🗑 Supprimer ce compte
                  </button>
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
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <style>{globalStyles}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div onClick={() => setPage("boutique")} style={{ cursor: "pointer" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 800, color: "#1a1a2e" }}>FastBuy</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 800, color: "#2563eb" }}>229</span>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ ...inp, marginBottom: 0, background: "#f3f4f6", borderRadius: 25, padding: "10px 18px", fontSize: 13, flex: 1, maxWidth: 300, margin: "0 2rem" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setPage("aide")} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer" }}>Aide</button>
            {client ? (
              <><button onClick={() => setPage("suivi")} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer" }}>Suivi</button>
              <button onClick={() => { setClient(null); localStorage.removeItem("fastbuy_client"); }} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer" }}>Déco</button></>
            ) : (
              <><button className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setShowLogin(true)}>Connexion</button>
              <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setShowInscription(true)}>S'inscrire</button></>
            )}
            <button onClick={() => setShowPanier(true)} style={{ background: "#eff6ff", border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#2563eb" }}>🛒 {panier.reduce((s, i) => s + i.qty, 0)}</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      {page === "boutique" && (
        <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2563eb 100%)", padding: "3rem 1.5rem", textAlign: "center", color: "#fff" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 800, marginBottom: 12 }}>FastBuy 229</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)" }}>La meilleure boutique du Bénin 🇧🇯</p>
        </div>
      )}

      {/* AIDE */}
      {page === "aide" && (
        <div style={{ maxWidth: 680, margin: "2rem auto", padding: "0 1.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "1.5rem" }}>Centre d'aide</h1>
          {[{ q: "Comment commander ?", r: "Sélectionne un produit, ajoute au panier, passe commande avec capture MTN." }, { q: "Délais ?", r: "1-3 semaines selon le produit." }, { q: "Paiement ?", r: `Envoie au ${MOMO}` }, { q: "Suivi ?", r: "Clique 'Mes commandes'" }].map((faq, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "1.2rem", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{faq.q}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{faq.r}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 12 }}>
            <a href={`https://wa.me/${SUPPORT_WA}`} target="_blank" style={{ flex: 1, padding: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", borderRadius: 10, textAlign: "center", textDecoration: "none", fontWeight: 500, fontSize: 13 }}>💬 WhatsApp</a>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ flex: 1, padding: "12px", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", borderRadius: 10, textAlign: "center", textDecoration: "none", fontWeight: 500, fontSize: 13 }}>📧 Email</a>
          </div>
        </div>
      )}

      {/* SUIVI */}
      {page === "suivi" && (
        <div style={{ maxWidth: 680, margin: "2rem auto", padding: "0 1.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "1.5rem" }}>Mes commandes</h1>
          <input placeholder="CMD-XXXXX" value={cmdSuivi || ""} onChange={e => setCmdSuivi(e.target.value)} style={inp} />
          {cmdSuivi && (() => {
            const cmd = commandes.find(c => c.numero === cmdSuivi.toUpperCase());
            if (!cmd) return <p style={{ color: "#ef4444" }}>Non trouvée</p>;
            const etapes = ["En attente", "Confirmé", "Expédié", "Livré"];
            const idx = etapes.indexOf(cmd.statut);
            return (
              <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", marginTop: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{cmd.numero}</div>
                <div style={{ color: "#2563eb", fontSize: 15, fontWeight: 700, marginTop: 8 }}>{cmd.totalFinal?.toLocaleString()} FCFA</div>
                <div style={{ display: "flex", gap: 0, marginTop: 16 }}>
                  {etapes.map((e, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: i <= idx ? "#2563eb" : "#e5e7eb", color: i <= idx ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, margin: "0 auto 6px" }}>{i + 1}</div>
                      <div style={{ fontSize: 11, color: i <= idx ? "#2563eb" : "#9ca3af" }}>{e}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* BOUTIQUE */}
      {page === "boutique" && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: "1.5rem" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCatActive(cat)} style={{ padding: "8px 18px", borderRadius: 25, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", border: "1.5px solid", background: catActive === cat ? "#2563eb" : "#fff", color: catActive === cat ? "#fff" : "#6b7280", borderColor: catActive === cat ? "#2563eb" : "#e5e7eb" }}>
                {cat}
              </button>
            ))}
          </div>
          {produitsFiltres.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#9ca3af" }}>🔍 Aucun</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {produitsFiltres.map(item => (
                <div key={item.id} className="card" onClick={() => { setShowProduit(item); setPhotoChoisie(0); setCouleurChoisie(""); setTailleChoisie(""); }} style={{ cursor: "pointer" }}>
                  <div style={{ height: 180, background: "#f3f4f6", overflow: "hidden" }}>
                    {(item.images?.[0] || item.image) ? <img src={getImageUrl(item.images?.[0] || item.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>}
                  </div>
                  <div style={{ padding: "14px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>{item.category}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#2563eb" }}>{item.price?.toLocaleString()} FCFA</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DETAIL */}
      {showProduit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowProduit(null)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{showProduit.title}</h2>
              <span onClick={() => setShowProduit(null)} style={{ cursor: "pointer", fontSize: 22 }}>×</span>
            </div>
            {(() => {
              const photos = showProduit.images?.length > 0 ? showProduit.images : showProduit.image ? [showProduit.image] : [];
              return (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ height: 250, background: "#f3f4f6", borderRadius: 12, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                    {photos.length > 0 ? <img src={getImageUrl(photos[photoChoisie])} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "3rem" }}>📦</span>}
                  </div>
                  {photos.length > 1 && (
                    <div style={{ display: "flex", gap: 8 }}>
                      {photos.map((p, i) => (
                        <img key={i} src={getImageUrl(p)} alt="" onClick={() => setPhotoChoisie(i)} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6, cursor: "pointer", border: `2px solid ${photoChoisie === i ? "#2563eb" : "#e5e7eb"}` }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>🚚 {showProduit.plage_livraison} · {showProduit.etat}</div>
            {showProduit.description && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: "1rem" }}>{showProduit.description}</div>}
            
            {/* VARIANTES */}
            {(() => {
              let variantes = [];
              try {
                if (showProduit.variantes) {
                  variantes = typeof showProduit.variantes === "string" ? JSON.parse(showProduit.variantes) : showProduit.variantes;
                }
              } catch (e) {}
              
              if (variantes.length === 0) {
                return (
                  <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px", marginBottom: "1.5rem", fontWeight: 700, fontSize: 15, color: "#2563eb" }}>
                    {showProduit.price?.toLocaleString()} FCFA
                  </div>
                );
              }
              
              // Récupérer les couleurs disponibles
              const couleurs = [...new Set(variantes.map(v => v.couleur))];
              
              // Récupérer les tailles filtrées selon la couleur choisie
              const tailles = couleurChoisie 
                ? [...new Set(variantes.filter(v => v.couleur === couleurChoisie).map(v => v.taille))]
                : [];
              
              // Trouver le prix et stock actuels
              let prixActuel = showProduit.price;
              let stockActuel = "disponible";
              let varianteTrouvee = null;
              
              if (couleurChoisie && tailleChoisie) {
                varianteTrouvee = variantes.find(v => v.couleur === couleurChoisie && v.taille === tailleChoisie);
                if (varianteTrouvee) {
                  prixActuel = parseInt(varianteTrouvee.prix);
                  stockActuel = varianteTrouvee.stock;
                }
              }
              
              return (
                <>
                  {/* COULEUR - OBLIGATOIRE */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#1a1a2e" }}>🎨 Couleur *</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {couleurs.map(c => (
                        <button 
                          key={c} 
                          onClick={() => { setCouleurChoisie(c); setTailleChoisie(""); }} 
                          style={{ 
                            padding: "8px 14px", 
                            borderRadius: 8, 
                            border: `2px solid ${couleurChoisie === c ? "#2563eb" : "#e5e7eb"}`, 
                            background: couleurChoisie === c ? "#eff6ff" : "#fff", 
                            color: couleurChoisie === c ? "#2563eb" : "#6b7280", 
                            fontSize: 13, 
                            fontWeight: 600, 
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* TAILLE - FILTRÉE & OBLIGATOIRE */}
                  {couleurChoisie && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#1a1a2e" }}>📏 Taille *</div>
                      {tailles.length > 0 ? (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {tailles.map(t => (
                            <button 
                              key={t} 
                              onClick={() => setTailleChoisie(t)} 
                              style={{ 
                                padding: "8px 14px", 
                                borderRadius: 8, 
                                border: `2px solid ${tailleChoisie === t ? "#2563eb" : "#e5e7eb"}`, 
                                background: tailleChoisie === t ? "#eff6ff" : "#fff", 
                                color: tailleChoisie === t ? "#2563eb" : "#6b7280", 
                                fontSize: 13, 
                                fontWeight: 600, 
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>Pas de tailles pour cette couleur</div>
                      )}
                    </div>
                  )}
                  
                  {/* PRIX & STOCK */}
                  {couleurChoisie && tailleChoisie && (
                    <div style={{ background: stockActuel === "rupture" ? "#fef2f2" : "#f0f9ff", borderRadius: 12, padding: "14px", marginBottom: "1.5rem", border: `1px solid ${stockActuel === "rupture" ? "#fecaca" : "#bfdbfe"}` }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: stockActuel === "rupture" ? "#ef4444" : "#2563eb", marginBottom: 4 }}>
                        {prixActuel?.toLocaleString()} FCFA
                      </div>
                      {stockActuel === "rupture" && (
                        <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 500 }}>🚫 Rupture de stock</div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
            
            <button 
              onClick={() => ajouterAuPanier(showProduit, couleurChoisie, tailleChoisie)} 
              disabled={!couleurChoisie || !tailleChoisie}
              className="btn-primary" 
              style={{ width: "100%", padding: "12px 0", opacity: (!couleurChoisie || !tailleChoisie) ? 0.5 : 1, cursor: (!couleurChoisie || !tailleChoisie) ? "not-allowed" : "pointer" }}>
              {!client ? "🔒 Connecte-toi" : (!couleurChoisie || !tailleChoisie) ? "Choisis couleur + taille" : "🛒 Ajouter"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL PANIER */}
      {showPanier && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPanier(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Panier</h2>
            {panier.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>🛒 Vide</div>
            ) : (
              <>
                {panier.map(item => (
                  <div key={item.key} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                    <div style={{ width: 48, height: 48, background: "#f3f4f6", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                      {(item.images?.[0] || item.image) ? <img src={getImageUrl(item.images?.[0] || item.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div>📦</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {item.title}
                        {item.couleurChoisie && <span style={{ fontSize: 12, color: "#6b7280" }}> • {item.couleurChoisie}</span>}
                        {item.tailleChoisie && <span style={{ fontSize: 12, color: "#6b7280" }}> • {item.tailleChoisie}</span>}
                      </div>
                      <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 600, marginTop: 4 }}>{(item.price * item.qty).toLocaleString()} FCFA</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setPanier(prev => prev.map(i => i.key === item.key ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} style={{ width: 24, height: 24, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", borderRadius: "50%" }}>−</button>
                      <span style={{ fontWeight: 600, width: 16, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => setPanier(prev => prev.map(i => i.key === item.key ? { ...i, qty: i.qty + 1 } : i))} style={{ width: 24, height: 24, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", borderRadius: "50%" }}>+</button>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "1rem 0", borderTop: "2px solid #f3f4f6", marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: "#2563eb" }}>{totalFinal.toLocaleString()} FCFA</span>
                  </div>
                  <button className="btn-primary" style={{ width: "100%" }} onClick={() => { setShowPanier(false); setShowCommande(true); }}>Commander</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL COMMANDE */}
      {showCommande && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCommande(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Commande</h2>
            <input placeholder="Nom *" value={formCmd.nom} onChange={e => setFormCmd({ ...formCmd, nom: e.target.value })} style={inp} />
            <input placeholder="Email *" type="email" value={formCmd.email} onChange={e => setFormCmd({ ...formCmd, email: e.target.value })} style={inp} />
            <input placeholder="Téléphone *" value={formCmd.telephone} onChange={e => setFormCmd({ ...formCmd, telephone: e.target.value })} style={inp} />
            <input placeholder="Ville *" value={formCmd.ville} onChange={e => setFormCmd({ ...formCmd, ville: e.target.value })} style={inp} />
            <input placeholder="Adresse *" value={formCmd.adresse} onChange={e => setFormCmd({ ...formCmd, adresse: e.target.value })} style={inp} />
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem", marginBottom: 16, fontSize: 13 }}>
              Envoie <strong>{totalFinal.toLocaleString()} FCFA</strong> au <strong>{MOMO}</strong>
            </div>
            <div onClick={() => document.getElementById("capture-input").click()} style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "1rem", textAlign: "center", cursor: "pointer", marginBottom: 16, background: "#fafafa" }}>
              {captureFile ? <span style={{ fontSize: 13, color: "#16a34a" }}>✅ {captureFile.name}</span> : <span style={{ fontSize: 13 }}>📎 Clique</span>}
              <input id="capture-input" type="file" accept="image/*" onChange={e => setCaptureFile(e.target.files[0])} style={{ display: "none" }} />
            </div>
            <button onClick={envoyerCommande} disabled={loading} className="btn-primary" style={{ width: "100%" }}>
              {loading ? "..." : `✅ ${totalFinal.toLocaleString()} FCFA`}
            </button>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>Succès !</h2>
            <p style={{ color: "#6b7280", marginBottom: 16 }}>{showConfirm.nom}</p>
            <div style={{ background: "#eff6ff", borderRadius: 10, padding: "1rem", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#2563eb" }}>{showConfirm.numero}</div>
            </div>
            <button className="btn-primary" style={{ width: "100%" }} onClick={() => setShowConfirm(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {showLogin && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLogin(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Connexion</h2>
            <input placeholder="Email/Tel" value={loginForm.identifiant} onChange={e => setLoginForm({ ...loginForm, identifiant: e.target.value })} style={inp} />
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input type={showPwdLogin ? "text" : "password"} placeholder="Mot de passe" value={loginForm.motDePasse} onChange={e => setLoginForm({ ...loginForm, motDePasse: e.target.value })} style={{ ...inp, marginBottom: 0, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPwdLogin(p => !p)} style={pwdButtonStyle}>{showPwdLogin ? "🙈" : "👁️"}</button>
            </div>
            {authError && <div style={{ color: "#ef4444", marginBottom: 12 }}>{authError}</div>}
            <button className="btn-primary" style={{ width: "100%", marginBottom: 12 }} onClick={connecter}>Connexion</button>
            <div style={{ textAlign: "center", fontSize: 13 }}>
              <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => { setShowLogin(false); setShowMdpOublie(true); }}>Oubli</span> · <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => { setShowLogin(false); setShowInscription(true); }}>Inscrire</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSCRIPTION */}
      {showInscription && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowInscription(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>S'inscrire</h2>
            <input placeholder="Prénom" value={inscForm.prenom} onChange={e => setInscForm({ ...inscForm, prenom: e.target.value })} style={inp} />
            <input placeholder="Nom" value={inscForm.nom} onChange={e => setInscForm({ ...inscForm, nom: e.target.value })} style={inp} />
            <input placeholder="Email" type="email" value={inscForm.email} onChange={e => setInscForm({ ...inscForm, email: e.target.value })} style={inp} />
            <input placeholder="Téléphone" value={inscForm.telephone} onChange={e => setInscForm({ ...inscForm, telephone: e.target.value })} style={inp} />
            <input placeholder="JJ/MM/AAAA" value={inscForm.date_naissance} onChange={e => formatDate(e.target.value, setInscForm, "date_naissance")} style={inp} maxLength={10} />
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input type={showPwdInsc ? "text" : "password"} placeholder="MDP" value={inscForm.mot_de_passe} onChange={e => setInscForm({ ...inscForm, mot_de_passe: e.target.value })} style={{ ...inp, marginBottom: 0, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPwdInsc(p => !p)} style={pwdButtonStyle}>{showPwdInsc ? "🙈" : "👁️"}</button>
            </div>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input type={showPwdInsc ? "text" : "password"} placeholder="Confirmer" value={inscForm.confirmer} onChange={e => setInscForm({ ...inscForm, confirmer: e.target.value })} style={{ ...inp, marginBottom: 0, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPwdInsc(p => !p)} style={pwdButtonStyle}>{showPwdInsc ? "🙈" : "👁️"}</button>
            </div>
            {authError && <div style={{ color: "#ef4444", marginBottom: 12 }}>{authError}</div>}
            <button className="btn-primary" style={{ width: "100%", marginBottom: 12 }} onClick={inscrire}>Créer</button>
          </div>
        </div>
      )}

      {/* MODAL MDP OUBLIÉ */}
      {showMdpOublie && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMdpOublie(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Réinitialiser</h2>
            <input placeholder="Email" value={mdpForm.email} onChange={e => setMdpForm({ ...mdpForm, email: e.target.value })} style={inp} />
            <input placeholder="Téléphone" value={mdpForm.telephone} onChange={e => setMdpForm({ ...mdpForm, telephone: e.target.value })} style={inp} />
            <input placeholder="JJ/MM/AAAA" value={mdpForm.date_naissance} onChange={e => formatDate(e.target.value, setMdpForm, "date_naissance")} style={inp} maxLength={10} />
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input type={showPwdForgot ? "text" : "password"} placeholder="Nouveau" value={mdpForm.nouveau} onChange={e => setMdpForm({ ...mdpForm, nouveau: e.target.value })} style={{ ...inp, marginBottom: 0, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPwdForgot(p => !p)} style={pwdButtonStyle}>{showPwdForgot ? "🙈" : "👁️"}</button>
            </div>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input type={showPwdForgot ? "text" : "password"} placeholder="Confirmer" value={mdpForm.confirmer} onChange={e => setMdpForm({ ...mdpForm, confirmer: e.target.value })} style={{ ...inp, marginBottom: 0, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPwdForgot(p => !p)} style={pwdButtonStyle}>{showPwdForgot ? "🙈" : "👁️"}</button>
            </div>
            {authError && <div style={{ color: "#ef4444", marginBottom: 12 }}>{authError}</div>}
            <button className="btn-primary" style={{ width: "100%", marginBottom: 16 }} onClick={reinitMdp}>Valider</button>
          </div>
        </div>
      )}
    </div>
  );
}