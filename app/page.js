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
  .btn-primary { background: #2563eb; color: #fff; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
  .btn-secondary { background: #fff; color: #2563eb; border: 1.5px solid #2563eb; border-radius: 10px; padding: 11px 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .btn-secondary:hover { background: #eff6ff; }
  .card { background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); overflow: hidden; transition: all 0.25s; }
  .card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.12); transform: translateY(-3px); }
  input, select, textarea { width: 100%; padding: 12px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: 'Inter', sans-serif; background: #fff; color: #1a1a2e; outline: none; transition: border 0.2s; }
  input:focus, select:focus, textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .tag { display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1.5px solid transparent; transition: all 0.2s; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); }
  .modal { background: #fff; border-radius: 20px; padding: 2rem; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease; }
  @keyframes slideUp { from { opacity:0; transform: translateY(30px); } to { opacity:1; transform: translateY(0); } }
  .navbar { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 1px solid #f0f0f0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f1f1f1; } ::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 3px; }
  .badge { background: #ef4444; color: #fff; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; position: absolute; top: -6px; right: -6px; }
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [nouvVar, setNouvVar] = useState({ couleur: "", taille: "", prix: "", stock: "disponible" });
  const [newProduct, setNewProduct] = useState({ title: "", description: "", price: "", etat: "Neuf", category: "Vêtements", plage_livraison: "1-2 semaines" });
  const [formCmd, setFormCmd] = useState({ nom: "", email: "", telephone: "", telephoneLivreur: "", ville: "", adresse: "" });
  const [loginForm, setLoginForm] = useState({ identifiant: "", motDePasse: "" });
  const [inscForm, setInscForm] = useState({ prenom: "", nom: "", email: "", telephone: "", date_naissance: "", mot_de_passe: "", confirmer: "" });
  const [mdpForm, setMdpForm] = useState({ email: "", telephone: "", date_naissance: "", nouveau: "", confirmer: "" });
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const savedPwd = localStorage.getItem("fastbuy_admin_pwd");
    if (savedPwd) setAdminMotDePasse(savedPwd);
    const savedClient = localStorage.getItem("fastbuy_client");
    if (savedClient) setClient(JSON.parse(savedClient));
    const savedPanier = localStorage.getItem("fastbuy_panier");
    if (savedPanier) setPanier(JSON.parse(savedPanier));
    if (typeof window !== "undefined" && window.location.pathname === "/admin" || window.location.search.includes("page=admin") || window.location.search.includes("page=admin")) setPage("admin");
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
    if (mot_de_passe.length < 6) { setAuthError("Mot de passe trop court (6 min) !"); return; }
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

  // ===================== RENDER =====================

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
                      <input type="password" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} placeholder="Mot de passe" style={inp} onKeyDown={e => e.key === "Enter" && (() => {
                        if (adminPwd === adminMotDePasse) { setAdminOk(true); setAdminTentatives(0); chargerCommandes(); chargerMessages(); }
                        else {
                          const n = adminTentatives + 1; setAdminTentatives(n); setAdminPwd("");
                          if (n >= 3) { setAdminBloque(true); let t = 300; setAdminBloqueTimer(t); const iv = setInterval(() => { t--; setAdminBloqueTimer(t); if (t <= 0) { clearInterval(iv); setAdminBloque(false); setAdminTentatives(0); } }, 1000); }
                        }
                      })()} />
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
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 800, color: "#1a1a2e" }}>FastBuy 229 — Admin</h1>
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
              <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", textAlign: "center", color: "#9ca3af", marginBottom: "2rem" }}>Aucune commande pour l'instant</div>
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
                        }} style={{ marginTop: 6, padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12, cursor: "pointer", color: cmd.statut === "Livré" ? "#16a34a" : cmd.statut === "Expédié" ? "#2563eb" : "#f59e0b" }}>
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
                    }} style={{ marginTop: 8, padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, width: "100%", fontSize: 13, fontFamily: "'Inter', sans-serif", resize: "vertical" }} rows={2} />
                  </div>
                ))}
              </div>
            )}

            {/* Produits admin */}
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "#1a1a2e" }}>🛍️ Produits ({produits.length})</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {produits.map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ height: 120, background: "#f3f4f6", overflow: "hidden" }}>
                    {(p.images?.[0] || p.image) ? <img src={getImageUrl(p.images?.[0] || p.image)} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>📦</div>}
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{p.variantes?.length > 0 ? `${p.variantes.length} variantes` : `${p.price?.toLocaleString()} FCFA`}</div>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700 }}>Ajouter un produit</h2>
                <span onClick={() => setShowAddProduct(false)} style={{ cursor: "pointer", fontSize: 22, color: "#9ca3af" }}>×</span>
              </div>

              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Nom du produit *</label>
              <input value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} placeholder="Ex: Robe fleurie, iPhone 14..." style={inp} />

              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Description</label>
              <textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Description du produit..." style={{ ...inp, resize: "vertical" }} rows={3} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 0 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Catégorie</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={inp}>
                    {CATEGORIES.filter(c => c !== "Tous").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>État</label>
                  <select value={newProduct.etat} onChange={e => setNewProduct({ ...newProduct, etat: e.target.value })} style={inp}>
                    <option>Neuf</option>
                    <option>Comme neuf</option>
                    <option>Bon état</option>
                  </select>
                </div>
              </div>

              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Délai de livraison</label>
              <select value={newProduct.plage_livraison} onChange={e => setNewProduct({ ...newProduct, plage_livraison: e.target.value })} style={inp}>
                <option>1-3 jours</option>
                <option>3-5 jours</option>
                <option>1-2 semaines</option>
                <option>2-3 semaines</option>
              </select>

              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Photos (jusqu'à 5)</label>
              <div onClick={() => document.getElementById("photo-input").click()} style={{ border: "2px dashed #d1d5db", borderRadius: 12, padding: "1.2rem", textAlign: "center", cursor: "pointer", marginBottom: 12, background: "#fafafa" }}>
                {imagePreviews.length > 0 ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                    {imagePreviews.map((p, i) => <img key={i} src={p} alt="" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8 }} />)}
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>📷</div>
                    <div style={{ fontSize: 13, color: "#9ca3af" }}>Clique pour ajouter jusqu'à 5 photos</div>
                  </div>
                )}
                <input id="photo-input" type="file" accept="image/*" multiple onChange={e => {
                  const files = Array.from(e.target.files).slice(0, 5);
                  setImageFiles(files);
                  setImagePreviews(files.map(f => URL.createObjectURL(f)));
                }} style={{ display: "none" }} />
              </div>

              {/* Variantes */}
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "1rem", marginBottom: "1rem" }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: "#1a1a2e" }}>Variantes (couleurs / tailles / prix)</div>

                {variantes.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    {variantes.map((v, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f9fafb", borderRadius: 8, padding: "8px 12px", marginBottom: 6, border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: 13 }}>
                          {v.couleur && <span style={{ color: "#2563eb", marginRight: 8, fontWeight: 500 }}>🎨 {v.couleur}</span>}
                          {v.taille && <span style={{ color: "#059669", marginRight: 8, fontWeight: 500 }}>📏 {v.taille}</span>}
                          <span style={{ fontWeight: 700 }}>{parseInt(v.prix).toLocaleString()} FCFA</span>
                          <span style={{ fontSize: 11, color: v.stock === "disponible" ? "#16a34a" : "#ef4444", marginLeft: 8 }}>{v.stock === "disponible" ? "✅ Stock" : "❌ Rupture"}</span>
                        </div>
                        <span onClick={() => setVariantes(prev => prev.filter((_, idx) => idx !== i))} style={{ cursor: "pointer", color: "#ef4444", fontSize: 16 }}>×</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px", border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Couleur</label>
                      <input type="text" placeholder="Ex: Rouge, Bleu..." value={nouvVar.couleur} onChange={e => setNouvVar(p => ({ ...p, couleur: e.target.value }))} style={{ ...inp, marginBottom: 0, fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Taille / Volume</label>
                      <input type="text" placeholder="Ex: S, M, L, 100ml..." value={nouvVar.taille} onChange={e => setNouvVar(p => ({ ...p, taille: e.target.value }))} style={{ ...inp, marginBottom: 0, fontSize: 13 }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Prix (FCFA) *</label>
                      <input type="number" placeholder="Ex: 15000" value={nouvVar.prix} onChange={e => setNouvVar(p => ({ ...p, prix: e.target.value }))} style={{ ...inp, marginBottom: 0, fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Stock</label>
                      <select value={nouvVar.stock} onChange={e => setNouvVar(p => ({ ...p, stock: e.target.value }))} style={{ ...inp, marginBottom: 0, fontSize: 13, cursor: "pointer" }}>
                        <option value="disponible">✅ Disponible</option>
                        <option value="rupture">❌ Rupture</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={() => {
                    if (!nouvVar.prix) { alert("Le prix est obligatoire !"); return; }
                    setVariantes(prev => [...prev, { ...nouvVar }]);
                    setNouvVar({ couleur: "", taille: "", prix: "", stock: "disponible" });
                  }} style={{ width: "100%", padding: "9px 0", background: "#eff6ff", border: "1.5px solid #bfdbfe", color: "#2563eb", borderRadius: 9, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                    + Ajouter cette variante
                  </button>
                </div>

                {variantes.length === 0 && (
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Ou prix fixe (si pas de variantes)</label>
                    <input type="number" placeholder="Ex: 15000" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} style={inp} />
                  </div>
                )}
              </div>

              <button onClick={ajouterProduit} disabled={loading} className="btn-primary" style={{ width: "100%" }}>
                {loading ? "Ajout en cours..." : "✅ Publier le produit"}
              </button>
            </div>
          </div>
        )}

        {/* Modal gérer clients */}
        {gererClients && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setGererClients(false)}>
            <div className="modal">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700 }}>Gérer les clients</h2>
                <span onClick={() => setGererClients(false)} style={{ cursor: "pointer", fontSize: 22, color: "#9ca3af" }}>×</span>
              </div>
              <input placeholder="Rechercher par email..." value={clientRecherche} onChange={e => setClientRecherche(e.target.value)} style={inp} />
              <button className="btn-primary" style={{ width: "100%", marginBottom: 16 }} onClick={async () => {
                const { data } = await supabase.from("users").select("*").eq("email", clientRecherche).maybeSingle();
                setClientTrouve(data || null);
              }}>Rechercher</button>
              {clientTrouve === null && clientRecherche && <p style={{ color: "#ef4444", fontSize: 13 }}>Aucun client trouvé</p>}
              {clientTrouve && (
                <div style={{ background: "#f9fafb", borderRadius: 12, padding: "1rem", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{clientTrouve.nom}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>{clientTrouve.email} · {clientTrouve.telephone}</div>
                  <input type="password" placeholder="Nouveau mot de passe" value={nouveauMdpClient} onChange={e => setNouveauMdpClient(e.target.value)} style={inp} />
                  <button className="btn-primary" style={{ width: "100%" }} onClick={async () => {
                    if (!nouveauMdpClient || nouveauMdpClient.length < 6) { alert("Mot de passe trop court !"); return; }
                    await supabase.from("users").update({ mot_de_passe: nouveauMdpClient }).eq("id", clientTrouve.id);
                    alert("Mot de passe mis à jour !"); setNouveauMdpClient(""); setClientTrouve(null);
                  }}>Changer le mot de passe</button>
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." style={{ ...inp, marginBottom: 0, background: "#f3f4f6", border: "1.5px solid #e5e7eb", borderRadius: 25, padding: "10px 18px", fontSize: 13 }} />
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
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowPanier(true)} style={{ background: "#eff6ff", border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#2563eb" }}>
                🛒 {panier.reduce((s, i) => s + i.qty, 0)}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      {page === "boutique" && (
        <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2563eb 100%)", padding: "3rem 1.5rem", textAlign: "center", color: "#fff" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 800, marginBottom: 12 }}>Bienvenue sur FastBuy 229</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", maxWidth: 500, margin: "0 auto 1.5rem" }}>La meilleure boutique en ligne du Bénin. Livraison rapide et sécurisée.</p>
          {!client && <button className="btn-primary" style={{ background: "#f59e0b", border: "none", padding: "12px 32px", fontSize: 15 }} onClick={() => setShowInscription(true)}>Créer mon compte</button>}
        </div>
      )}

      {/* PAGE AIDE */}
      {page === "aide" && (
        <div style={{ maxWidth: 680, margin: "2rem auto", padding: "0 1.5rem" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: "1.5rem", color: "#1a1a2e" }}>Centre d'aide</h1>
          {[
            { q: "Comment passer une commande ?", r: "Choisissez votre produit, ajoutez-le au panier, puis suivez les étapes de commande. Vous aurez un numéro de suivi." },
            { q: "Comment payer ?", r: `Nous acceptons MTN MoMo, Moov Money et Celtiis. Envoyez le paiement au ${MOMO} puis téléchargez votre capture.` },
            { q: "Délais de livraison ?", r: "Entre 1 et 3 semaines selon le produit. Le délai est indiqué sur chaque fiche produit." },
            { q: "Comment suivre ma commande ?", r: "Dans 'Mes commandes', entrez votre numéro de commande (ex: CMD-XXXXXX) pour voir l'état en temps réel." },
          ].map((faq, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "1.2rem 1.5rem", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{faq.q}</div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{faq.r}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: "1.5rem" }}>
            <a href={`https://wa.me/${SUPPORT_WA}`} target="_blank" style={{ flex: 1, padding: "14px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", color: "#16a34a", borderRadius: 14, textAlign: "center", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>💬 WhatsApp</a>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ flex: 1, padding: "14px", background: "#eff6ff", border: "1.5px solid #bfdbfe", color: "#2563eb", borderRadius: 14, textAlign: "center", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>📧 Email</a>
          </div>
        </div>
      )}

      {/* PAGE SUIVI */}
      {page === "suivi" && (
        <div style={{ maxWidth: 680, margin: "2rem auto", padding: "0 1.5rem" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 800, marginBottom: "1.5rem", color: "#1a1a2e" }}>Mes commandes</h1>
          <input placeholder="Entrez votre numéro CMD-XXXXXX" value={cmdSuivi || ""} onChange={e => setCmdSuivi(e.target.value)} style={inp} />
          {cmdSuivi && (() => {
            const cmd = commandes.find(c => c.numero === cmdSuivi.toUpperCase());
            if (!cmd) return <p style={{ color: "#ef4444", fontSize: 14 }}>Commande introuvable</p>;
            const etapes = ["En attente", "Confirmé", "Expédié", "Livré"];
            const idx = etapes.indexOf(cmd.statut);
            return (
              <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{cmd.numero}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: "1.5rem" }}>{cmd.nom} · {cmd.totalFinal?.toLocaleString()} FCFA</div>
                <div style={{ display: "flex", gap: 0, marginBottom: "1rem" }}>
                  {etapes.map((e, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: i <= idx ? "#2563eb" : "#e5e7eb", color: i <= idx ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, margin: "0 auto 6px" }}>{i + 1}</div>
                      <div style={{ fontSize: 11, color: i <= idx ? "#2563eb" : "#9ca3af", fontWeight: i === idx ? 600 : 400 }}>{e}</div>
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
          {/* Catégories */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: "1.5rem", paddingBottom: 4 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCatActive(cat)} style={{ padding: "8px 18px", borderRadius: 25, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", border: "1.5px solid", background: catActive === cat ? "#2563eb" : "#fff", color: catActive === cat ? "#fff" : "#6b7280", borderColor: catActive === cat ? "#2563eb" : "#e5e7eb", transition: "all 0.2s", fontFamily: "'Inter', sans-serif" }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Grille produits */}
          {produitsFiltres.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#9ca3af" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>Aucun produit trouvé</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
              {produitsFiltres.map(item => (
                <div key={item.id} className="card" onClick={() => { setShowProduit(item); setPhotoChoisie(0); setVarianteCouleur(""); setVarianteTaille(""); }} style={{ cursor: "pointer" }}>
                  <div style={{ height: 200, background: "#f3f4f6", overflow: "hidden", position: "relative" }}>
                    {(item.images?.[0] || item.image) ? (
                      <img src={getImageUrl(item.images?.[0] || item.image)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>📦</div>
                    )}
                    <div style={{ position: "absolute", top: 10, left: 10, background: item.etat === "Neuf" ? "#eff6ff" : "#f0fdf4", color: item.etat === "Neuf" ? "#2563eb" : "#16a34a", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{item.etat}</div>
                  </div>
                  <div style={{ padding: "14px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>{item.category}</div>
                    {item.variantes?.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                        {[...new Set(item.variantes.map(v => v.couleur).filter(Boolean))].slice(0, 3).map((c, i) => (
                          <span key={i} style={{ fontSize: 10, background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: 10 }}>{c}</span>
                        ))}
                        {[...new Set(item.variantes.map(v => v.taille).filter(Boolean))].slice(0, 3).map((t, i) => (
                          <span key={i} style={{ fontSize: 10, background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: 10 }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#2563eb" }}>
                      {item.variantes?.length > 0 ? `À partir de ${Math.min(...item.variantes.map(v => parseInt(v.prix) || 0)).toLocaleString()}` : item.price?.toLocaleString()} FCFA
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DETAIL PRODUIT */}
      {showProduit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowProduit(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700 }}>{showProduit.title}</h2>
              <span onClick={() => setShowProduit(null)} style={{ cursor: "pointer", fontSize: 22, color: "#9ca3af" }}>×</span>
            </div>

            {/* Photos */}
            {(() => {
              const photos = showProduit.images?.length > 0 ? showProduit.images : showProduit.image ? [showProduit.image] : [];
              return (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ height: 280, background: "#f3f4f6", borderRadius: 14, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                    {photos.length > 0 ? <img src={getImageUrl(photos[photoChoisie])} alt={showProduit.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "4rem" }}>📦</span>}
                  </div>
                  {photos.length > 1 && (
                    <div style={{ display: "flex", gap: 8 }}>
                      {photos.map((p, i) => (
                        <img key={i} src={getImageUrl(p)} alt="" onClick={() => setPhotoChoisie(i)} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: `2px solid ${photoChoisie === i ? "#2563eb" : "#e5e7eb"}` }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>🚚 Livraison : {showProduit.plage_livraison} · {showProduit.etat}</div>
            {showProduit.description && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: "1rem", lineHeight: 1.7 }}>{showProduit.description}</div>}

            {/* Couleurs */}
            {showProduit.variantes?.length > 0 && [...new Set(showProduit.variantes.map(v => v.couleur).filter(Boolean))].length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#374151" }}>Couleur :</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[...new Set(showProduit.variantes.map(v => v.couleur).filter(Boolean))].map((c, i) => (
                    <button key={i} onClick={() => setVarianteCouleur(c)} style={{ padding: "8px 18px", borderRadius: 25, fontSize: 13, cursor: "pointer", border: "1.5px solid", background: varianteCouleur === c ? "#eff6ff" : "#fff", color: varianteCouleur === c ? "#2563eb" : "#374151", borderColor: varianteCouleur === c ? "#2563eb" : "#e5e7eb", fontFamily: "'Inter', sans-serif", fontWeight: varianteCouleur === c ? 600 : 400 }}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Tailles */}
            {showProduit.variantes?.length > 0 && [...new Set(showProduit.variantes.map(v => v.taille).filter(Boolean))].length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#374151" }}>Taille / Volume :</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[...new Set(showProduit.variantes.filter(v => !varianteCouleur || v.couleur === varianteCouleur).map(v => v.taille).filter(Boolean))].map((t, i) => (
                    <button key={i} onClick={() => setVarianteTaille(t)} style={{ padding: "8px 18px", borderRadius: 25, fontSize: 13, cursor: "pointer", border: "1.5px solid", background: varianteTaille === t ? "#f0fdf4" : "#fff", color: varianteTaille === t ? "#16a34a" : "#374151", borderColor: varianteTaille === t ? "#16a34a" : "#e5e7eb", fontFamily: "'Inter', sans-serif", fontWeight: varianteTaille === t ? 600 : 400 }}>{t}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Prix selon variante */}
            {(() => {
              if (showProduit.variantes?.length > 0) {
                const v = showProduit.variantes.find(v =>
                  (!varianteCouleur || v.couleur === varianteCouleur) &&
                  (!varianteTaille || v.taille === varianteTaille)
                );
                const prix = v ? parseInt(v.prix) : Math.min(...showProduit.variantes.map(v => parseInt(v.prix) || 0));
                return (
                  <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 16px", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#2563eb" }}>
                      {v ? prix.toLocaleString() : `À partir de ${prix.toLocaleString()}`} FCFA
                    </div>
                    {v && <div style={{ fontSize: 12, color: v.stock === "disponible" ? "#16a34a" : "#ef4444", fontWeight: 500 }}>{v.stock === "disponible" ? "✅ En stock" : "❌ Rupture"}</div>}
                  </div>
                );
              }
              return (
                <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 16px", marginBottom: "1.5rem" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#2563eb" }}>{showProduit.price?.toLocaleString()} FCFA</div>
                </div>
              );
            })()}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => ajouterAuPanier(showProduit, varianteCouleur, varianteTaille)} className="btn-primary" style={{ flex: 1, padding: "14px 0" }}>
                {client ? "🛒 Ajouter au panier" : "🔒 Connexion requise"}
              </button>
              {client && (
                <button onClick={() => { setProduitNegocie(showProduit); setShowMessage(true); setShowProduit(null); }} style={{ padding: "14px 16px", background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, fontSize: 16, cursor: "pointer" }}>💬</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PANIER */}
      {showPanier && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPanier(false)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700 }}>Mon panier</h2>
              <span onClick={() => setShowPanier(false)} style={{ cursor: "pointer", fontSize: 22, color: "#9ca3af" }}>×</span>
            </div>
            {panier.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🛒</div>
                <div>Votre panier est vide</div>
              </div>
            ) : (
              <>
                {panier.map(item => (
                  <div key={item.key} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ width: 56, height: 56, background: "#f3f4f6", borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                      {(item.images?.[0] || item.image) ? <img src={getImageUrl(item.images?.[0] || item.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                      {(item.couleurChoisie || item.tailleChoisie) && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{[item.couleurChoisie, item.tailleChoisie].filter(Boolean).join(" · ")}</div>}
                      <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 600, marginTop: 2 }}>{(item.price * item.qty).toLocaleString()} FCFA</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => setPanier(prev => prev.map(i => i.key === item.key ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 700 }}>-</button>
                      <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => setPanier(prev => prev.map(i => i.key === item.key ? { ...i, qty: i.qty + 1 } : i))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 700 }}>+</button>
                      <button onClick={() => setPanier(prev => prev.filter(i => i.key !== item.key))} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: 16, marginLeft: 4 }}>×</button>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "1rem 0", borderTop: "2px solid #f3f4f6", marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input placeholder="Code promo" value={codePromo} onChange={e => setCodePromo(e.target.value)} style={{ ...inp, marginBottom: 0, flex: 1 }} />
                    <button className="btn-secondary" style={{ padding: "0 16px", whiteSpace: "nowrap" }} onClick={appliquerPromo}>Appliquer</button>
                  </div>
                  {promoMsg && <div style={{ fontSize: 13, color: reduction > 0 ? "#16a34a" : "#ef4444", marginBottom: 12 }}>{promoMsg}</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, color: "#6b7280" }}>Sous-total</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{totalPanier.toLocaleString()} FCFA</span>
                  </div>
                  {reduction > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 14, color: "#16a34a" }}>Réduction -{reduction}%</span>
                      <span style={{ fontSize: 14, color: "#16a34a" }}>-{(totalPanier - totalFinal).toLocaleString()} FCFA</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: "#2563eb" }}>{totalFinal.toLocaleString()} FCFA</span>
                  </div>
                  <button className="btn-primary" style={{ width: "100%" }} onClick={() => { setShowPanier(false); setShowCommande(true); }}>Commander maintenant</button>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700 }}>Finaliser la commande</h2>
              <span onClick={() => setShowCommande(false)} style={{ cursor: "pointer", fontSize: 22, color: "#9ca3af" }}>×</span>
            </div>
            <input placeholder="Nom complet *" value={formCmd.nom} onChange={e => setFormCmd({ ...formCmd, nom: e.target.value })} style={inp} />
            <input placeholder="Email *" type="email" value={formCmd.email} onChange={e => setFormCmd({ ...formCmd, email: e.target.value })} style={inp} />
            <input placeholder="Téléphone *" value={formCmd.telephone} onChange={e => setFormCmd({ ...formCmd, telephone: e.target.value })} style={inp} />
            <input placeholder="Téléphone livreur (optionnel)" value={formCmd.telephoneLivreur} onChange={e => setFormCmd({ ...formCmd, telephoneLivreur: e.target.value })} style={inp} />
            <input placeholder="Ville *" value={formCmd.ville} onChange={e => setFormCmd({ ...formCmd, ville: e.target.value })} style={inp} />
            <input placeholder="Adresse complète *" value={formCmd.adresse} onChange={e => setFormCmd({ ...formCmd, adresse: e.target.value })} style={inp} />

            <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12, padding: "1rem", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>💳 Paiement Mobile Money</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>Envoyez <strong>{totalFinal.toLocaleString()} FCFA</strong> au <strong>{MOMO}</strong> (MTN MoMo, Moov ou Celtiis), puis téléchargez la capture.</div>
            </div>

            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Capture de paiement</label>
            <div onClick={() => document.getElementById("capture-input").click()} style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "1rem", textAlign: "center", cursor: "pointer", marginBottom: 16, background: "#fafafa" }}>
              {captureFile ? <span style={{ fontSize: 13, color: "#16a34a" }}>✅ {captureFile.name}</span> : <span style={{ fontSize: 13, color: "#9ca3af" }}>📎 Cliquer pour télécharger</span>}
              <input id="capture-input" type="file" accept="image/*" onChange={e => setCaptureFile(e.target.files[0])} style={{ display: "none" }} />
            </div>

            <button onClick={envoyerCommande} disabled={loading} className="btn-primary" style={{ width: "100%" }}>
              {loading ? "Envoi..." : `✅ Confirmer — ${totalFinal.toLocaleString()} FCFA`}
            </button>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: 8 }}>Commande confirmée !</h2>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>Merci {showConfirm.nom} ! Votre commande a été reçue.</p>
            <div style={{ background: "#eff6ff", borderRadius: 12, padding: "1rem", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#6b7280" }}>Numéro de commande</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#2563eb" }}>{showConfirm.numero}</div>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Gardez ce numéro pour suivre votre commande.</p>
            <button className="btn-primary" style={{ width: "100%" }} onClick={() => setShowConfirm(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {showLogin && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLogin(false)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700 }}>Connexion</h2>
              <span onClick={() => setShowLogin(false)} style={{ cursor: "pointer", fontSize: 22, color: "#9ca3af" }}>×</span>
            </div>
            <input placeholder="Email ou téléphone" value={loginForm.identifiant} onChange={e => setLoginForm({ ...loginForm, identifiant: e.target.value })} style={inp} />
            <input type="password" placeholder="Mot de passe" value={loginForm.motDePasse} onChange={e => setLoginForm({ ...loginForm, motDePasse: e.target.value })} style={inp} />
            {authError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{authError}</div>}
            <button className="btn-primary" style={{ width: "100%", marginBottom: 12 }} onClick={connecter}>Se connecter</button>
            <div style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
              <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => { setShowLogin(false); setShowMdpOublie(true); setAuthError(""); }}>Mot de passe oublié ?</span>
              {" · "}
              <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => { setShowLogin(false); setShowInscription(true); setAuthError(""); }}>Créer un compte</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSCRIPTION */}
      {showInscription && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowInscription(false)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700 }}>Créer un compte</h2>
              <span onClick={() => setShowInscription(false)} style={{ cursor: "pointer", fontSize: 22, color: "#9ca3af" }}>×</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 0 }}>
              <input placeholder="Prénom *" value={inscForm.prenom} onChange={e => setInscForm({ ...inscForm, prenom: e.target.value })} style={inp} />
              <input placeholder="Nom *" value={inscForm.nom} onChange={e => setInscForm({ ...inscForm, nom: e.target.value })} style={inp} />
            </div>
            <input placeholder="Email *" type="email" value={inscForm.email} onChange={e => setInscForm({ ...inscForm, email: e.target.value })} style={inp} />
            <input placeholder="Téléphone *" value={inscForm.telephone} onChange={e => setInscForm({ ...inscForm, telephone: e.target.value })} style={inp} />
            <input placeholder="Date de naissance JJ/MM/AAAA *" value={inscForm.date_naissance} onChange={e => formatDate(e.target.value, setInscForm, "date_naissance")} style={inp} maxLength={10} />
            <input type="password" placeholder="Mot de passe *" value={inscForm.mot_de_passe} onChange={e => setInscForm({ ...inscForm, mot_de_passe: e.target.value })} style={inp} />
            <input type="password" placeholder="Confirmer le mot de passe *" value={inscForm.confirmer} onChange={e => setInscForm({ ...inscForm, confirmer: e.target.value })} style={inp} />
            {authError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{authError}</div>}
            <button className="btn-primary" style={{ width: "100%", marginBottom: 12 }} onClick={inscrire}>Créer mon compte</button>
            <div style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
              Déjà un compte ?{" "}
              <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => { setShowInscription(false); setShowLogin(true); setAuthError(""); }}>Se connecter</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MOT DE PASSE OUBLIÉ */}
      {showMdpOublie && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMdpOublie(false)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700 }}>Mot de passe oublié</h2>
              <span onClick={() => setShowMdpOublie(false)} style={{ cursor: "pointer", fontSize: 22, color: "#9ca3af" }}>×</span>
            </div>
            <input placeholder="Email *" value={mdpForm.email} onChange={e => setMdpForm({ ...mdpForm, email: e.target.value })} style={inp} />
            <input placeholder="Téléphone *" value={mdpForm.telephone} onChange={e => setMdpForm({ ...mdpForm, telephone: e.target.value })} style={inp} />
            <input placeholder="Date de naissance JJ/MM/AAAA *" value={mdpForm.date_naissance} onChange={e => formatDate(e.target.value, setMdpForm, "date_naissance")} style={inp} maxLength={10} />
            <input type="password" placeholder="Nouveau mot de passe *" value={mdpForm.nouveau} onChange={e => setMdpForm({ ...mdpForm, nouveau: e.target.value })} style={inp} />
            <input type="password" placeholder="Confirmer le nouveau mot de passe *" value={mdpForm.confirmer} onChange={e => setMdpForm({ ...mdpForm, confirmer: e.target.value })} style={inp} />
            {authError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{authError}</div>}
            <button className="btn-primary" style={{ width: "100%", marginBottom: 16 }} onClick={reinitMdp}>Réinitialiser</button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>Tu ne te souviens plus de tes infos ?</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <a href={`https://wa.me/${SUPPORT_WA}?text=Bonjour%2C%20j%27ai%20oubli%C3%A9%20mes%20informations%20FastBuy%20229`} target="_blank" style={{ padding: "9px 18px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", color: "#16a34a", borderRadius: 10, fontSize: 13, textDecoration: "none", fontWeight: 500 }}>💬 WhatsApp</a>
                <a href={`mailto:${SUPPORT_EMAIL}?subject=Aide%20connexion%20FastBuy%20229`} style={{ padding: "9px 18px", background: "#eff6ff", border: "1.5px solid #bfdbfe", color: "#2563eb", borderRadius: 10, fontSize: 13, textDecoration: "none", fontWeight: 500 }}>📧 Email</a>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span style={{ cursor: "pointer", color: "#6b7280", fontSize: 13 }} onClick={() => { setShowMdpOublie(false); setShowLogin(true); setAuthError(""); }}>← Retour à la connexion</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MESSAGE */}
      {showMessage && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMessage(false)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700 }}>Envoyer un message</h2>
              <span onClick={() => setShowMessage(false)} style={{ cursor: "pointer", fontSize: 22, color: "#9ca3af" }}>×</span>
            </div>
            {produitNegocie && <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#374151" }}>Produit : <strong>{produitNegocie.title}</strong></div>}
            <textarea placeholder="Votre message..." value={messageTexte} onChange={e => setMessageTexte(e.target.value)} style={{ ...inp, resize: "vertical" }} rows={4} />
            <button className="btn-primary" style={{ width: "100%" }} onClick={async () => {
              if (!messageTexte.trim()) return;
              await supabase.from("messages").insert([{ user_id: client?.id, nom: client?.nom, telephone: client?.telephone, message: produitNegocie ? `[${produitNegocie.title}] ${messageTexte}` : messageTexte }]);
              alert("Message envoyé !"); setShowMessage(false); setMessageTexte("");
            }}>Envoyer</button>
          </div>
        </div>
      )}
    </div>
  );
}