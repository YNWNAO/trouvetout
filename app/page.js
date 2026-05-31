"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const CATEGORIES = ["Tous", "Vêtements", "Chaussures", "Parfums", "Téléphones", "Sacs", "Bijoux", "Ordinateurs", "Accessoires"];
const ADMIN_PWD = "N-beat3140";
const MOMO = "+229 57577895";
const ADMIN_EMAIL = "nahofalgbadamassi@gmail.com";
const ADMIN_WHATSAPP = "+33775958442";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f8f9fa; color: #1a1a2e; }
  input, select, textarea { width: 100%; padding: 12px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; background: #fff; outline: none; }
  input:focus, select:focus, textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); overflow-y: auto; }
  .modal { background: #fff; border-radius: 20px; padding: 2rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
  .btn-primary { background: #2563eb; color: #fff; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; }
  .btn-primary:hover { background: #1d4ed8; }
`;

export default function FastBuy229() {
  const [page, setPage] = useState("accueil");
  const [genreChoisi, setGenreChoisi] = useState(null);
  const [showGenreModal, setShowGenreModal] = useState(true);
  const [produits, setProduits] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [clients, setClients] = useState([]);
  const [catActive, setCatActive] = useState("Tous");
  const [search, setSearch] = useState("");
  const [panier, setPanier] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showInscription, setShowInscription] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPanier, setShowPanier] = useState(false);
  const [showCommande, setShowCommande] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [showProduit, setShowProduit] = useState(null);
  const [showContactAdmin, setShowContactAdmin] = useState(false);
  const [showClientMessages, setShowClientMessages] = useState(false);
  const [photoChoisie, setPhotoChoisie] = useState(0);
  const [couleurChoisie, setCouleurChoisie] = useState("");
  const [tailleChoisie, setTailleChoisie] = useState("");
  const [adminOk, setAdminOk] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [showPwdAdmin, setShowPwdAdmin] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showGererClients, setShowGererClients] = useState(false);
  const [clientRecherche, setClientRecherche] = useState("");
  const [clientTrouve, setClientTrouve] = useState(null);
  const [nouveauMdpClient, setNouveauMdpClient] = useState("");
  const [messageAuClient, setMessageAuClient] = useState("");
  const [selectedClientMessagesId, setSelectedClientMessagesId] = useState(null);
  const [messageContact, setMessageContact] = useState("");
  const [messageContactNom, setMessageContactNom] = useState("");
  const [messageContactTel, setMessageContactTel] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [forgotData, setForgotData] = useState({ email: "", telephone: "", date_naissance: "", nouveauMdp: "", confirmer: "" });
  const [forgotError, setForgotError] = useState("");
  const [newProduct, setNewProduct] = useState({ title: "", description: "", etat: "Neuf", category: "Vêtements", genre: "Homme", plage_livraison: "1-2 semaines" });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [nouvVar, setNouvVar] = useState({ couleur: "", taille: "", prix: "" });
  const [formCmd, setFormCmd] = useState({ nom: "", email: "", telephone: "", ville: "", adresse: "" });
  const [loginForm, setLoginForm] = useState({ identifiant: "", motDePasse: "" });
  const [inscForm, setInscForm] = useState({ prenom: "", nom: "", email: "", telephone: "", date_naissance: "", mot_de_passe: "", confirmer: "" });
  const [authError, setAuthError] = useState("");
  const [showPwdLogin, setShowPwdLogin] = useState(false);
  const [showPwdInsc, setShowPwdInsc] = useState(false);
  const [captureFile, setCaptureFile] = useState(null);
  const [codePromo, setCodePromo] = useState("");
  const [reduction, setReduction] = useState(0);
  const [reponseMessage, setReponseMessage] = useState({});
  const [chatMessage, setChatMessage] = useState("");
  const [messageClientAdmin, setMessageClientAdmin] = useState("");
  const messagesEndRef = useRef(null);

  const pwdButtonStyle = { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#374151", padding: "4px 8px", zIndex: 10 };

  useEffect(() => {
    const savedGenre = localStorage.getItem("fastbuy_genre");
    const savedClient = localStorage.getItem("fastbuy_client");
    const savedPanier = localStorage.getItem("fastbuy_panier");
    
    if (savedGenre) {
      setGenreChoisi(savedGenre);
      setShowGenreModal(false);
    }
    if (savedClient) setClient(JSON.parse(savedClient));
    if (savedPanier) setPanier(JSON.parse(savedPanier));
    
    chargerProduits();
    chargerMessages();
    if (typeof window !== "undefined" && window.location.search.includes("page=admin")) {
      setPage("admin");
      setShowGenreModal(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fastbuy_panier", JSON.stringify(panier));
  }, [panier]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (showClientMessages || showGererClients || page === "admin") {
        chargerMessages();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [showClientMessages, showGererClients, page]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedClientMessagesId]);

  const chargerProduits = async () => {
    const { data } = await supabase.from("produits").select("*").order("created_at", { ascending: false });
    if (data) setProduits(data);
  };

  const chargerCommandes = async () => {
    const { data } = await supabase.from("commandes").select("*").order("created_at", { ascending: false });
    if (data) setCommandes(data);
  };

  const chargerMessages = async () => {
    try {
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
      if (data) setMessages(data);
    } catch (e) {
      console.error("Erreur chargement messages:", e);
    }
  };

  const chargerClients = async () => {
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (data) setClients(data);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://nuhpdqioggxznceqvpvx.supabase.co/storage/v1/object/public/produits/${path}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const produitsFiltres = produits.filter(p => {
    const matchCat = catActive === "Tous" || p.category === catActive;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchGenre = !genreChoisi || genreChoisi === "Tous" || p.genre === genreChoisi;
    return matchCat && matchSearch && matchGenre;
  });

  const totalPanier = panier.reduce((s, i) => s + i.price * i.qty, 0);
  const totalFinal = Math.round(totalPanier * (1 - reduction / 100));

  const choisirGenre = (genre) => {
    setGenreChoisi(genre);
    localStorage.setItem("fastbuy_genre", genre);
    setShowGenreModal(false);
  };

  const ajouterAuPanier = (prod, couleur = "", taille = "") => {
    if (!client) { setShowLogin(true); return; }
    const key = `${prod.id}-${couleur}-${taille}`;
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
    if (mot_de_passe.length < 8) { setAuthError("Minimum 8 caractères !"); return; }
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
    let { data } = await supabase.from("users").select("*").eq("email", identifiant).maybeSingle();
    if (!data) {
      ({ data } = await supabase.from("users").select("*").eq("telephone", identifiant).maybeSingle());
    }
    if (!data) { setAuthError("Compte non trouvé !"); return; }
    if (data.mot_de_passe !== motDePasse) { setAuthError("Mot de passe incorrect !"); return; }
    const user = { id: data.id, nom: data.nom, email: data.email, telephone: data.telephone };
    setClient(user);
    localStorage.setItem("fastbuy_client", JSON.stringify(user));
    setShowLogin(false);
    setLoginForm({ identifiant: "", motDePasse: "" });
  };

  const reinitialiserMdp = async () => {
    setForgotError("");
    const { email, telephone, date_naissance, nouveauMdp, confirmer } = forgotData;
    if (!email || !telephone || !date_naissance || !nouveauMdp) { setForgotError("Remplis tous les champs !"); return; }
    if (nouveauMdp !== confirmer) { setForgotError("Les mots de passe ne correspondent pas !"); return; }
    if (nouveauMdp.length < 8) { setForgotError("Minimum 8 caractères !"); return; }
    
    const { data } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
    if (!data) { setForgotError("Email non trouvé !"); return; }
    if (data.telephone !== telephone) { setForgotError("Téléphone incorrect !"); return; }
    if (data.date_naissance !== date_naissance) { setForgotError("Date de naissance incorrecte !"); return; }
    
    await supabase.from("users").update({ mot_de_passe: nouveauMdp }).eq("id", data.id);
    alert("Mot de passe réinitialisé !");
    setShowForgotPassword(false);
    setForgotData({ email: "", telephone: "", date_naissance: "", nouveauMdp: "", confirmer: "" });
  };

  const envoyerCommande = async () => {
    const { nom, email, telephone, ville, adresse } = formCmd;
    if (!nom || !email || !telephone || !ville || !adresse) { alert("Remplis tous les champs !"); return; }
    if (panier.length === 0) { alert("Panier vide !"); return; }
    if (!captureFile) { alert("Capture requise !"); return; }
    setLoading(true);
    let capturePath = null;
    const fn = `captures/${Date.now()}-${captureFile.name}`;
    const { error } = await supabase.storage.from("produits").upload(fn, captureFile);
    if (!error) capturePath = fn;
    const num = "CMD-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    await supabase.from("commandes").insert([{
      numero: num, nom, email, telephone, ville, adresse, articles: JSON.stringify(panier),
      total: totalPanier, totalFinal, reduction, codePromo, statut: "En attente", paiement: "En attente", capture: capturePath, user_id: client?.id
    }]);
    setShowConfirm({ numero: num, nom, totalFinal });
    setPanier([]);
    setShowCommande(false);
    setLoading(false);
    setCaptureFile(null);
  };

  const envoyerMessage = async () => {
    if (!messageContact.trim()) { alert("Message vide !"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("messages").insert([{
        user_id: client?.id || null,
        nom: messageContactNom || "Visiteur",
        telephone: messageContactTel || "",
        message: messageContact,
        reponse: "",
        sender_type: "client"
      }]);
      if (error) throw error;
      alert("Message envoyé !");
      setMessageContact("");
      setMessageContactNom("");
      setMessageContactTel("");
      setShowContactAdmin(false);
      chargerMessages();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
    setLoading(false);
  };

  const repondreAuMessage = async (msgId, reponse) => {
    if (!reponse.trim()) { alert("Message vide !"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("messages").update({ reponse }).eq("id", msgId);
      if (error) throw error;
      setReponseMessage({ ...reponseMessage, [msgId]: "" });
      chargerMessages();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
    setLoading(false);
  };

  const envoyerMessageAuClient = async () => {
    if (!messageAuClient.trim() || !clientTrouve) { alert("Message vide !"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("messages").insert([{
        user_id: clientTrouve.id,
        nom: "Admin FastBuy",
        telephone: ADMIN_WHATSAPP,
        message: messageAuClient,
        sender_type: "admin",
        conversation_id: clientTrouve.id
      }]);
      if (error) throw error;
      alert("Message envoyé !");
      setMessageAuClient("");
    } catch (e) {
      alert("Erreur: " + e.message);
    }
    setLoading(false);
  };

  const envoyerChatMessage = async () => {
    if (!chatMessage.trim()) { alert("Message vide !"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("messages").insert([{
        user_id: client?.id,
        nom: client?.nom,
        telephone: client?.telephone,
        message: chatMessage,
        sender_type: "client",
        conversation_id: client?.id
      }]);
      if (error) throw error;
      setChatMessage("");
      chargerMessages();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
    setLoading(false);
  };

  const envoyerMessageClientAdmin = async () => {
    if (!messageClientAdmin.trim() || !selectedClientMessagesId) { alert("Message vide !"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("messages").insert([{
        user_id: selectedClientMessagesId,
        nom: "Admin FastBuy",
        telephone: ADMIN_WHATSAPP,
        message: messageClientAdmin,
        sender_type: "admin",
        conversation_id: selectedClientMessagesId
      }]);
      if (error) throw error;
      setMessageClientAdmin("");
      chargerMessages();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
    setLoading(false);
  };

  const ajouterProduit = async () => {
    if (!newProduct.title) { alert("Titre requis !"); return; }
    if (variantes.length === 0) { alert("Ajoute une variante !"); return; }
    setLoading(true);
    try {
      let imagePaths = [];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fn = `${Date.now()}-${Math.random()}.jpg`;
          const { error: uploadError } = await supabase.storage.from("produits").upload(fn, file);
          if (uploadError) { alert("Erreur upload"); setLoading(false); return; }
          imagePaths.push(fn);
        }
      }
      const prixBase = Math.min(...variantes.map(v => parseInt(v.prix) || 0));
      await supabase.from("produits").insert([{
        ...newProduct, price: prixBase, image: imagePaths[0] || null, images: imagePaths,
        variantes: JSON.stringify(variantes.map(({ id, ...v }) => v))
      }]);
      alert("Produit créé !");
      await chargerProduits();
      setShowAddProduct(false);
      setNewProduct({ title: "", description: "", etat: "Neuf", category: "Vêtements", genre: "Homme", plage_livraison: "1-2 semaines" });
      setImageFiles([]); setImagePreviews([]); setVariantes([]);
      setLoading(false);
    } catch (e) {
      alert("Erreur: " + e.message);
      setLoading(false);
    }
  };

  const clientMessages = messages.filter(m => m.user_id === client?.id || m.conversation_id === client?.id);
  const unreadCount = clientMessages.length;
  
  // Grouper les messages par conversation pour admin
  const conversationMap = {};
  messages.forEach(msg => {
    const convId = msg.conversation_id || msg.user_id;
    if (!conversationMap[convId]) {
      conversationMap[convId] = [];
    }
    conversationMap[convId].push(msg);
  });

  const messagesForSelectedClient = selectedClientMessagesId ? (conversationMap[selectedClientMessagesId] || []) : [];

  if (page === "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        <style>{globalStyles}</style>
        {!adminOk ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 400, boxShadow: "0 4px 30px rgba(0,0,0,0.1)" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, textAlign: "center", marginBottom: "2rem" }}>Espace Admin</h1>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <input type={showPwdAdmin ? "text" : "password"} value={adminPwd} onChange={e => setAdminPwd(e.target.value)} placeholder="Mot de passe" style={{ width: "100%", padding: "12px 40px 12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10 }} />
                <button type="button" onClick={() => setShowPwdAdmin(p => !p)} style={pwdButtonStyle}>{showPwdAdmin ? "Masquer" : "Afficher"}</button>
              </div>
              <button className="btn-primary" onClick={() => { if (adminPwd === ADMIN_PWD) { setAdminOk(true); chargerCommandes(); chargerMessages(); chargerClients(); } else { alert("Incorrect !"); setAdminPwd(""); } }}>Accéder</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Admin FastBuy</h1>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn-primary" style={{ width: "auto", padding: "10px 20px" }} onClick={() => setShowAddProduct(true)}>Ajouter Produit</button>
                <button className="btn-primary" style={{ width: "auto", padding: "10px 20px", background: "#10b981" }} onClick={() => { setShowGererClients(true); chargerClients(); chargerMessages(); }}>Gérer Clients</button>
                <button className="btn-primary" style={{ width: "auto", padding: "10px 20px", background: "#f59e0b" }} onClick={() => { chargerCommandes(); chargerMessages(); }}>Actualiser</button>
                <button onClick={() => { setAdminOk(false); setAdminPwd(""); }} style={{ padding: "10px 18px", background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>Déconnexion</button>
              </div>
            </div>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Produits ({produits.length})</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: "2rem" }}>
              {produits.map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ height: 100, background: "#f3f4f6", overflow: "hidden" }}>
                    {(p.images?.[0] || p.image) ? <img src={getImageUrl(p.images?.[0] || p.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>Pas d'image</div>}
                  </div>
                  <div style={{ padding: "8px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{p.title?.slice(0, 15)}</div>
                    <button onClick={async () => { if (confirm("Supprimer?")) { await supabase.from("produits").delete().eq("id", p.id); await chargerProduits(); } }} style={{ width: "100%", padding: "3px 0", background: "#fef2f2", border: "none", color: "#ef4444", borderRadius: 4, fontSize: 9, cursor: "pointer", fontWeight: 600 }}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Commandes ({commandes.length})</h2>
            <div style={{ marginBottom: "2rem", maxHeight: 400, overflowY: "auto" }}>
              {commandes.length === 0 ? (
                <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 12, textAlign: "center", color: "#9ca3af" }}>Aucune commande</div>
              ) : (
                commandes.map(cmd => (
                  <div key={cmd.id} style={{ background: "#fff", borderRadius: 12, padding: "1rem", marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{cmd.numero} - {cmd.nom}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{cmd.telephone} / {cmd.ville}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{cmd.totalFinal?.toLocaleString()} FCFA</div>
                      </div>
                      <select value={cmd.statut} onChange={async e => { await supabase.from("commandes").update({ statut: e.target.value }).eq("id", cmd.id); chargerCommandes(); }} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 12, cursor: "pointer", minWidth: 120 }}>
                        <option>En attente</option>
                        <option>Confirmé</option>
                        <option>Expédié</option>
                        <option>Livré</option>
                        <option>Annulé</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Messages ({messages.filter(m => !m.reponse && m.sender_type === "client").length})</h2>
            <div style={{ marginBottom: "2rem", maxHeight: 500, overflowY: "auto" }}>
              {messages.filter(m => m.sender_type === "client" && !m.reponse).length === 0 ? (
                <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 12, textAlign: "center", color: "#9ca3af" }}>Aucun message</div>
              ) : (
                messages.filter(m => m.sender_type === "client" && !m.reponse).map(msg => (
                  <div key={msg.id} style={{ background: "#fff", borderRadius: 12, padding: "1rem", marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{msg.nom} - {msg.telephone}</div>
                    <div style={{ background: "#f9fafb", padding: "8px", borderRadius: 6, fontSize: 13, marginBottom: 8, borderLeft: "3px solid #2563eb" }}>
                      {msg.message}
                      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>{formatTime(msg.created_at)}</div>
                    </div>
                    <div>
                      <textarea placeholder="Répondre..." value={reponseMessage[msg.id] || ""} onChange={e => setReponseMessage({ ...reponseMessage, [msg.id]: e.target.value })} style={{ width: "100%", padding: "8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, resize: "vertical", marginBottom: 8 }} rows={2} />
                      <button className="btn-primary" style={{ fontSize: 12, padding: "8px" }} onClick={() => repondreAuMessage(msg.id, reponseMessage[msg.id])} disabled={loading}>
                        {loading ? "Envoi..." : "Envoyer Réponse"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {showAddProduct && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddProduct(false)}>
            <div className="modal">
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Ajouter Produit</h2>
              <input value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} placeholder="Titre" style={{ marginBottom: 12 }} />
              <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={{ marginBottom: 12 }}>
                {CATEGORIES.filter(c => c !== "Tous").map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={newProduct.genre} onChange={e => setNewProduct({ ...newProduct, genre: e.target.value })} style={{ marginBottom: 12 }}>
                <option>Homme</option>
                <option>Femme</option>
                <option>Unisexe</option>
              </select>
              <div onClick={() => document.getElementById("photo-input").click()} style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "1rem", textAlign: "center", cursor: "pointer", marginBottom: 12, background: "#fafafa" }}>
                {imagePreviews.length > 0 ? (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                    {imagePreviews.map((p, i) => <img key={i} src={p} alt="" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }} />)}
                  </div>
                ) : <div style={{ fontSize: 12, color: "#9ca3af" }}>Cliquez pour ajouter des photos</div>}
                <input id="photo-input" type="file" accept="image/*" multiple onChange={e => {
                  const files = Array.from(e.target.files).slice(0, 5);
                  setImageFiles(files);
                  setImagePreviews(files.map(f => URL.createObjectURL(f)));
                }} style={{ display: "none" }} />
              </div>

              <div style={{ background: "#f0f9ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "1rem", marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: "#1e40af" }}>Variantes</div>
                <input placeholder="Couleur" value={nouvVar.couleur} onChange={e => setNouvVar({ ...nouvVar, couleur: e.target.value })} style={{ marginBottom: 10 }} />
                <input placeholder="Taille" value={nouvVar.taille} onChange={e => setNouvVar({ ...nouvVar, taille: e.target.value })} style={{ marginBottom: 10 }} />
                <input type="number" placeholder="Prix" value={nouvVar.prix} onChange={e => setNouvVar({ ...nouvVar, prix: e.target.value })} style={{ marginBottom: 10 }} />
                <button onClick={() => {
                  if (!nouvVar.couleur || !nouvVar.taille || !nouvVar.prix) { alert("Remplis tous les champs !"); return; }
                  setVariantes([...variantes, { ...nouvVar, id: Date.now() }]);
                  setNouvVar({ couleur: "", taille: "", prix: "" });
                }} style={{ width: "100%", padding: "10px 0", background: "#dbeafe", border: "1px solid #93c5fd", color: "#1e40af", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Ajouter Variante</button>
                {variantes.length > 0 && (
                  <div style={{ marginTop: 12, maxHeight: 150, overflowY: "auto" }}>
                    {variantes.map(v => (
                      <div key={v.id} style={{ background: "#fff", borderRadius: 8, padding: "8px", marginBottom: 6, display: "flex", justifyContent: "space-between", fontSize: 12, border: "1px solid #e5e7eb" }}>
                        <span><strong>{v.couleur} / {v.taille}</strong> - {v.prix} FCFA</span>
                        <button onClick={() => setVariantes(variantes.filter(vv => vv.id !== v.id))} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontSize: 10 }}>Supprimer</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={ajouterProduit} disabled={loading} className="btn-primary">
                {loading ? "Création..." : "Publier"}
              </button>
            </div>
          </div>
        )}

        {showGererClients && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowGererClients(false)}>
            <div className="modal" style={{ maxWidth: "800px", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: 0 }}>
              <div style={{ background: "#10b981", color: "#fff", padding: "1rem", fontWeight: 700, fontSize: "1.1rem", borderRadius: "20px 20px 0 0" }}>Gérer Clients</div>
              <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Liste clients */}
                <div style={{ width: "250px", borderRight: "1px solid #e5e7eb", overflowY: "auto", background: "#f9fafb", padding: "1rem" }}>
                  <input placeholder="Rechercher..." value={clientRecherche} onChange={e => setClientRecherche(e.target.value)} style={{ marginBottom: 12 }} />
                  {clients.filter(c => c.nom.toLowerCase().includes(clientRecherche.toLowerCase())).map(c => (
                    <div key={c.id} onClick={() => { setClientTrouve(c); setSelectedClientMessagesId(c.id); }} style={{ padding: "10px", borderRadius: 8, marginBottom: 8, fontSize: 12, cursor: "pointer", background: clientTrouve?.id === c.id ? "#10b981" : "#fff", color: clientTrouve?.id === c.id ? "#fff" : "#1a1a2e", border: "1px solid #e5e7eb" }}>
                      <div style={{ fontWeight: 600 }}>{c.nom}</div>
                      <div style={{ fontSize: 10, opacity: 0.8 }}>{c.telephone}</div>
                    </div>
                  ))}
                </div>

                {/* Chat + Actions */}
                {clientTrouve ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1rem" }}>
                    <div style={{ fontWeight: 600, marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #e5e7eb" }}>{clientTrouve.nom}</div>

                    {/* Chat messages */}
                    <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: 6 }}>
                      {messagesForSelectedClient.map(msg => (
                        <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender_type === "admin" ? "flex-end" : "flex-start" }}>
                          <div style={{ maxWidth: "70%", padding: "8px 12px", borderRadius: 12, background: msg.sender_type === "client" ? "#2563eb" : "#f3f4f6", color: msg.sender_type === "client" ? "#fff" : "#1a1a2e" }}>
                            <div style={{ fontSize: 12 }}>{msg.message}</div>
                            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{formatTime(msg.created_at)}</div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input message */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <input value={messageClientAdmin} onChange={e => setMessageClientAdmin(e.target.value)} placeholder="Message..." style={{ flex: 1, marginBottom: 0 }} />
                      <button onClick={envoyerMessageClientAdmin} disabled={loading} className="btn-primary" style={{ width: "auto", padding: "8px 16px" }}>Envoyer</button>
                    </div>

                    {/* Actions */}
                    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
                      <input type="password" placeholder="Nouveau mot de passe" value={nouveauMdpClient} onChange={e => setNouveauMdpClient(e.target.value)} style={{ marginBottom: 10 }} />
                      <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn-primary" style={{ background: "#10b981", flex: 1 }} onClick={async () => {
                          if (nouveauMdpClient.length < 8) { alert("Minimum 8 caractères !"); return; }
                          await supabase.from("users").update({ mot_de_passe: nouveauMdpClient }).eq("id", clientTrouve.id);
                          alert("Mot de passe changé !");
                          setNouveauMdpClient("");
                        }}>Changer MDP</button>
                        <button className="btn-primary" style={{ background: "#ef4444", flex: 1 }} onClick={async () => {
                          if (confirm("Supprimer ce client?")) {
                            await supabase.from("users").delete().eq("id", clientTrouve.id);
                            alert("Client supprimé !");
                            setClientTrouve(null);
                            await chargerClients();
                          }
                        }}>Supprimer</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>Sélectionne un client</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingBottom: 80 }}>
      <style>{globalStyles}</style>

      {showGenreModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "1rem" }}>FastBuy</h1>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: "2rem" }}>Qu'est-ce que tu cherches ?</p>
            <button className="btn-primary" style={{ marginBottom: 12 }} onClick={() => choisirGenre("Homme")}>Pour Homme</button>
            <button className="btn-primary" style={{ marginBottom: 12, background: "#ec4899" }} onClick={() => choisirGenre("Femme")}>Pour Femme</button>
            <button className="btn-primary" style={{ background: "#8b5cf6" }} onClick={() => choisirGenre("Tous")}>Voir Tout</button>
          </div>
        </div>
      )}

      <div style={{ background: "#1a1a2e", color: "#fff", padding: "8px 1.5rem", fontSize: 12, textAlign: "center", fontWeight: 600 }}>
        Livraison gratuite à partir de 20000 FCFA | 10% réduction 1ère commande
      </div>

      <div style={{ position: "sticky", top: 0, background: "#fff", padding: "12px 1.5rem", display: "flex", alignItems: "center", gap: 12, zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,0.1)", borderBottom: "2px solid #2563eb" }}>
        <div onClick={() => { setPage("accueil"); setCatActive("Tous"); }} style={{ cursor: "pointer", fontWeight: 800, fontSize: "1.3rem", color: "#2563eb" }}>FastBuy</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, color: "#1a1a2e" }} />
        <span style={{ cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "#1a1a2e" }} onClick={() => setShowPanier(true)}>Panier ({panier.reduce((s, i) => s + i.qty, 0)})</span>
        {client ? (
          <>
            <span style={{ position: "relative", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "#06b6d4" }} onClick={() => { setShowClientMessages(true); chargerMessages(); }}>
              Messages
              {unreadCount > 0 && <span style={{ position: "absolute", top: -8, right: -10, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{unreadCount}</span>}
            </span>
            <span style={{ cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "#1a1a2e" }} onClick={() => { setClient(null); localStorage.removeItem("fastbuy_client"); }}>Déco</span>
          </>
        ) : (
          <span style={{ cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "#2563eb" }} onClick={() => setShowLogin(true)}>Connexion</span>
        )}
        <span style={{ cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: "#6b7280", padding: "4px 8px", background: "#f3f4f6", borderRadius: 6 }} onClick={() => setShowGenreModal(true)}>{genreChoisi}</span>
      </div>

      <div style={{ background: "#fff", padding: "10px 1.5rem", display: "flex", gap: 8, overflowX: "auto", borderBottom: "1px solid #e5e7eb" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setCatActive(cat); setPage("produits"); }} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", background: catActive === cat ? "#2563eb" : "#f3f4f6", color: catActive === cat ? "#fff" : "#6b7280", border: "none" }}>
            {cat}
          </button>
        ))}
      </div>

      {page === "accueil" && (
        <>
          {produits.filter(p => !genreChoisi || genreChoisi === "Tous" || p.genre === genreChoisi).length > 0 && (
            <div style={{ position: "relative", height: 250, background: "#000", overflow: "hidden", marginBottom: 20 }}>
              <div style={{ display: "flex", transition: "transform 0.3s ease", transform: `translateX(-${heroIndex * 100}%)` }}>
                {produits.filter(p => !genreChoisi || genreChoisi === "Tous" || p.genre === genreChoisi).slice(0, 5).map((item, i) => (
                  <div key={i} style={{ minWidth: "100%", height: 250, position: "relative" }}>
                    {(item.images?.[0] || item.image) && <img src={getImageUrl(item.images?.[0] || item.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", color: "#fff", padding: "1rem" }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{item.title}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setHeroIndex(heroIndex > 0 ? heroIndex - 1 : Math.max(0, produits.filter(p => !genreChoisi || genreChoisi === "Tous" || p.genre === genreChoisi).length - 1))} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.7)", border: "none", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>{'<'}</button>
              <button onClick={() => setHeroIndex(heroIndex < Math.max(0, produits.filter(p => !genreChoisi || genreChoisi === "Tous" || p.genre === genreChoisi).length - 1) ? heroIndex + 1 : 0)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.7)", border: "none", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>{'>'}</button>
            </div>
          )}

          <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Catégories</h2>
              <button onClick={() => setShowContactAdmin(true)} style={{ padding: "6px 12px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Nous Contacter</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
              {CATEGORIES.filter(c => c !== "Tous").map(cat => {
                const catProduits = produits.filter(p => p.category === cat && (!genreChoisi || genreChoisi === "Tous" || p.genre === genreChoisi));
                const premierProduit = catProduits[0];
                return (
                  <div key={cat} onClick={() => { setCatActive(cat); setPage("produits"); }} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", height: 140, position: "relative" }}>
                    {premierProduit && (premierProduit.images?.[0] || premierProduit.image) ? (
                      <img src={getImageUrl(premierProduit.images?.[0] || premierProduit.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>Pas d'image</div>
                    )}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", color: "#fff", padding: "8px" }}>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{cat}</div>
                      <div style={{ fontSize: 10, opacity: 0.9 }}>{catProduits.length} articles</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {produits.filter(p => !genreChoisi || genreChoisi === "Tous" || p.genre === genreChoisi).length > 0 && (
            <div style={{ padding: "0 1.5rem 2rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Nouveautés</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                {produits.filter(p => !genreChoisi || genreChoisi === "Tous" || p.genre === genreChoisi).slice(0, 8).map(item => (
                  <div key={item.id} onClick={() => { setShowProduit(item); setPhotoChoisie(0); setCouleurChoisie(""); setTailleChoisie(""); }} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.06)", cursor: "pointer" }}>
                    <div style={{ height: 130, background: "#f3f4f6", overflow: "hidden" }}>
                      {(item.images?.[0] || item.image) ? <img src={getImageUrl(item.images?.[0] || item.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 12 }}>Pas d'image</div>}
                    </div>
                    <div style={{ padding: "8px" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, color: "#6b7280" }}>{item.title?.slice(0, 18)}</div>
                      <div style={{ fontWeight: 700, fontSize: 11, color: "#2563eb" }}>{item.price?.toLocaleString()} FCFA</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {page === "produits" && (
        <div style={{ padding: "1.5rem" }}>
          {produitsFiltres.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>Aucun produit</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
              {produitsFiltres.map(item => (
                <div key={item.id} onClick={() => { setShowProduit(item); setPhotoChoisie(0); setCouleurChoisie(""); setTailleChoisie(""); }} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.06)", cursor: "pointer" }}>
                  <div style={{ height: 130, background: "#f3f4f6", overflow: "hidden" }}>
                    {(item.images?.[0] || item.image) ? <img src={getImageUrl(item.images?.[0] || item.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 12 }}>Pas d'image</div>}
                  </div>
                  <div style={{ padding: "8px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, color: "#6b7280" }}>{item.title}</div>
                    <div style={{ fontWeight: 700, fontSize: 11, color: "#2563eb" }}>{item.price?.toLocaleString()} FCFA</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showProduit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowProduit(null)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{showProduit.title}</h2>
              <span onClick={() => setShowProduit(null)} style={{ cursor: "pointer", fontSize: 20 }}>x</span>
            </div>
            {(() => {
              const photos = showProduit.images?.length > 0 ? showProduit.images : showProduit.image ? [showProduit.image] : [];
              return (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ height: 200, background: "#f3f4f6", borderRadius: 12, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                    {photos.length > 0 ? <img src={getImageUrl(photos[photoChoisie])} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#9ca3af" }}>Pas d'image</span>}
                  </div>
                  {photos.length > 1 && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {photos.map((p, i) => (
                        <img key={i} src={getImageUrl(p)} alt="" onClick={() => setPhotoChoisie(i)} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, cursor: "pointer", border: `2px solid ${photoChoisie === i ? "#2563eb" : "#e5e7eb"}` }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            
            {(() => {
              let variantes = [];
              try {
                if (showProduit.variantes) {
                  variantes = typeof showProduit.variantes === "string" ? JSON.parse(showProduit.variantes) : showProduit.variantes;
                }
              } catch (e) {}
              
              if (variantes.length === 0) {
                return <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px", marginBottom: "1rem", fontWeight: 700, fontSize: 14, color: "#2563eb" }}>{showProduit.price?.toLocaleString()} FCFA</div>;
              }
              
              const couleurs = [...new Set(variantes.map(v => v.couleur))];
              const tailles = couleurChoisie ? [...new Set(variantes.filter(v => v.couleur === couleurChoisie).map(v => v.taille))] : [];
              
              return (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Couleur</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {couleurs.map(c => (
                        <button key={c} onClick={() => { setCouleurChoisie(c); setTailleChoisie(""); }} style={{ padding: "6px 12px", borderRadius: 6, border: `2px solid ${couleurChoisie === c ? "#2563eb" : "#e5e7eb"}`, background: couleurChoisie === c ? "#eff6ff" : "#fff", color: couleurChoisie === c ? "#2563eb" : "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {couleurChoisie && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Taille</div>
                      {tailles.length > 0 ? (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {tailles.map(t => (
                            <button key={t} onClick={() => setTailleChoisie(t)} style={{ padding: "6px 12px", borderRadius: 6, border: `2px solid ${tailleChoisie === t ? "#2563eb" : "#e5e7eb"}`, background: tailleChoisie === t ? "#eff6ff" : "#fff", color: tailleChoisie === t ? "#2563eb" : "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      ) : <div style={{ fontSize: 11, color: "#9ca3af" }}>Pas de tailles</div>}
                    </div>
                  )}
                </>
              );
            })()}
            
            <button onClick={() => ajouterAuPanier(showProduit, couleurChoisie, tailleChoisie)} disabled={!couleurChoisie || !tailleChoisie} className="btn-primary" style={{ opacity: (!couleurChoisie || !tailleChoisie) ? 0.5 : 1 }}>
              {!client ? "Connecte-toi" : (!couleurChoisie || !tailleChoisie) ? "Choisis" : "Ajouter"}
            </button>
          </div>
        </div>
      )}

      {showContactAdmin && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowContactAdmin(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Nous Contacter</h2>
            <div style={{ background: "#eff6ff", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#1e40af" }}>Contactez-nous via:</div>
              <div style={{ fontSize: 12, color: "#1a1a2e", marginBottom: 6 }}>
                <strong>Email:</strong> {ADMIN_EMAIL}
              </div>
              <div style={{ fontSize: 12, color: "#1a1a2e" }}>
                <strong>WhatsApp:</strong> {ADMIN_WHATSAPP}
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Ou envoyez-nous un message:</div>
              <input placeholder="Votre nom" value={messageContactNom} onChange={e => setMessageContactNom(e.target.value)} style={{ marginBottom: 10 }} />
              <input placeholder="Votre téléphone" value={messageContactTel} onChange={e => setMessageContactTel(e.target.value)} style={{ marginBottom: 10 }} />
              <textarea placeholder="Votre message..." value={messageContact} onChange={e => setMessageContact(e.target.value)} style={{ width: "100%", padding: "12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, marginBottom: 12, resize: "vertical" }} rows={4} />
            </div>

            <button className="btn-primary" onClick={envoyerMessage} disabled={loading}>
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </div>
      )}

      {showClientMessages && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowClientMessages(false)}>
          <div className="modal" style={{ maxWidth: "700px", maxHeight: "80vh", display: "flex", flexDirection: "column", padding: 0 }}>
            <div style={{ background: "#2563eb", color: "#fff", padding: "1rem", fontWeight: 700, borderRadius: "20px 20px 0 0" }}>Messages ({clientMessages.length})</div>
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: 8 }}>
              {clientMessages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>Aucun message</div>
              ) : (
                clientMessages.map(msg => (
                  <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender_type === "client" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "70%", padding: "8px 12px", borderRadius: 12, background: msg.sender_type === "client" ? "#2563eb" : "#f3f4f6", color: msg.sender_type === "client" ? "#fff" : "#1a1a2e" }}>
                      <div style={{ fontSize: 12 }}>{msg.message}</div>
                      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{formatTime(msg.created_at)}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: "1rem", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
              <input value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Message..." style={{ flex: 1, marginBottom: 0 }} />
              <button onClick={envoyerChatMessage} disabled={loading} className="btn-primary" style={{ width: "auto", padding: "8px 16px" }}>Envoyer</button>
            </div>
          </div>
        </div>
      )}

      {showPanier && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPanier(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>Panier</h2>
            {panier.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: "1rem" }}>Vide</div>
            ) : (
              <>
                {panier.map(item => (
                  <div key={item.key} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
                      {(item.images?.[0] || item.image) ? <img src={getImageUrl(item.images?.[0] || item.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div>-</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>{(item.price * item.qty).toLocaleString()} FCFA</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setPanier(prev => prev.map(i => i.key === item.key ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} style={{ width: 20, height: 20, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", borderRadius: "50%" }}>-</button>
                      <span style={{ fontWeight: 600, width: 14, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => setPanier(prev => prev.map(i => i.key === item.key ? { ...i, qty: i.qty + 1 } : i))} style={{ width: 20, height: 20, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", borderRadius: "50%" }}>+</button>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "1rem 0", borderTop: "2px solid #f3f4f6", marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ fontSize: 15, color: "#2563eb" }}>{totalFinal.toLocaleString()} FCFA</span>
                  </div>
                  <button className="btn-primary" onClick={() => { setShowPanier(false); setShowCommande(true); }}>Procéder</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showCommande && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCommande(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>Commande</h2>
            <input placeholder="Nom" value={formCmd.nom} onChange={e => setFormCmd({ ...formCmd, nom: e.target.value })} style={{ marginBottom: 12 }} />
            <input placeholder="Email" value={formCmd.email} onChange={e => setFormCmd({ ...formCmd, email: e.target.value })} style={{ marginBottom: 12 }} />
            <input placeholder="Téléphone" value={formCmd.telephone} onChange={e => setFormCmd({ ...formCmd, telephone: e.target.value })} style={{ marginBottom: 12 }} />
            <input placeholder="Ville" value={formCmd.ville} onChange={e => setFormCmd({ ...formCmd, ville: e.target.value })} style={{ marginBottom: 12 }} />
            <input placeholder="Adresse" value={formCmd.adresse} onChange={e => setFormCmd({ ...formCmd, adresse: e.target.value })} style={{ marginBottom: 12 }} />
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px", marginBottom: 12, fontSize: 12 }}>
              Envoyer {totalFinal.toLocaleString()} FCFA au {MOMO}
            </div>
            <div onClick={() => document.getElementById("capture-input").click()} style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "1rem", textAlign: "center", cursor: "pointer", marginBottom: 12, background: "#fafafa", fontSize: 12 }}>
              {captureFile ? <span style={{ color: "#16a34a" }}>OK</span> : <span>Cliquez pour capture</span>}
              <input id="capture-input" type="file" accept="image/*" onChange={e => setCaptureFile(e.target.files[0])} style={{ display: "none" }} />
            </div>
            <button onClick={envoyerCommande} disabled={loading} className="btn-primary">
              {loading ? "Envoi..." : "Confirmer"}
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>OK</div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}>Confirmé !</h2>
            <p style={{ color: "#6b7280", marginBottom: 12, fontSize: 13 }}>{showConfirm.nom}</p>
            <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#2563eb" }}>{showConfirm.numero}</div>
            </div>
            <button className="btn-primary" onClick={() => setShowConfirm(null)}>Fermer</button>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLogin(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Connexion</h2>
            <input placeholder="Email ou tel" value={loginForm.identifiant} onChange={e => setLoginForm({ ...loginForm, identifiant: e.target.value })} style={{ marginBottom: 12 }} />
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input type={showPwdLogin ? "text" : "password"} placeholder="Mot de passe" value={loginForm.motDePasse} onChange={e => setLoginForm({ ...loginForm, motDePasse: e.target.value })} style={{ width: "100%", padding: "12px 40px 12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10 }} />
              <button type="button" onClick={() => setShowPwdLogin(p => !p)} style={pwdButtonStyle}>{showPwdLogin ? "Masquer" : "Afficher"}</button>
            </div>
            {authError && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 12 }}>{authError}</div>}
            <button className="btn-primary" onClick={connecter} style={{ marginBottom: 12 }}>Connexion</button>
            <div style={{ textAlign: "center", fontSize: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => { setShowLogin(false); setShowInscription(true); }}>S'inscrire</span>
              <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => { setShowLogin(false); setShowForgotPassword(true); }}>Mot de passe oublié ?</span>
            </div>
          </div>
        </div>
      )}

      {showInscription && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowInscription(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>S'inscrire</h2>
            <input placeholder="Prénom" value={inscForm.prenom} onChange={e => setInscForm({ ...inscForm, prenom: e.target.value })} style={{ marginBottom: 12 }} />
            <input placeholder="Nom" value={inscForm.nom} onChange={e => setInscForm({ ...inscForm, nom: e.target.value })} style={{ marginBottom: 12 }} />
            <input placeholder="Email" value={inscForm.email} onChange={e => setInscForm({ ...inscForm, email: e.target.value })} style={{ marginBottom: 12 }} />
            <input placeholder="Tel" value={inscForm.telephone} onChange={e => setInscForm({ ...inscForm, telephone: e.target.value })} style={{ marginBottom: 12 }} />
            <input placeholder="JJ/MM/AAAA" value={inscForm.date_naissance} onChange={e => { let v = e.target.value.replace(/\D/g, ""); if (v.length >= 3 && v.length <= 4) v = v.slice(0, 2) + "/" + v.slice(2); else if (v.length >= 5) v = v.slice(0, 2) + "/" + v.slice(2, 4) + "/" + v.slice(4, 8); setInscForm({ ...inscForm, date_naissance: v }); }} style={{ marginBottom: 12 }} maxLength={10} />
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input type={showPwdInsc ? "text" : "password"} placeholder="Mot de passe" value={inscForm.mot_de_passe} onChange={e => setInscForm({ ...inscForm, mot_de_passe: e.target.value })} style={{ width: "100%", padding: "12px 40px 12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10 }} />
              <button type="button" onClick={() => setShowPwdInsc(p => !p)} style={pwdButtonStyle}>{showPwdInsc ? "Masquer" : "Afficher"}</button>
            </div>
            <input type={showPwdInsc ? "text" : "password"} placeholder="Confirmer" value={inscForm.confirmer} onChange={e => setInscForm({ ...inscForm, confirmer: e.target.value })} style={{ marginBottom: 12 }} />
            {authError && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 12 }}>{authError}</div>}
            <button className="btn-primary" onClick={inscrire}>Créer</button>
          </div>
        </div>
      )}

      {showForgotPassword && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForgotPassword(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Mot de passe oublié</h2>
            <input placeholder="Email" value={forgotData.email} onChange={e => setForgotData({ ...forgotData, email: e.target.value })} style={{ margin