"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const CATEGORIES = ["Tous", "Vêtements", "Chaussures", "Parfums", "Téléphones", "Sacs", "Bijoux", "Ordinateurs", "Accessoires"];
const ADMIN_PWD = "N-beat3140";
const MOMO = "+2290157577895";
const ADMIN_EMAIL = "nahofalgbadamassi@gmail.com";
const ADMIN_WHATSAPP = "+33775958442";
const FRAIS_LIVRAISON = {
  "Porto": 500,
  "Cotonou": 1000,
  "Calavi": 1500
};

const globalStyles = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',sans-serif;background:#f8f9fa;color:#1a1a2e}input,select,textarea{width:100%;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;background:#fff;outline:none}input:focus,select:focus,textarea:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,0.1)}.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(4px);overflow-y:auto}.modal{background:#fff;border-radius:20px;padding:2rem;width:100%;max-width:600px;max-height:90vh;overflow-y:auto}.btn-primary{background:#2563eb;color:#fff;border:none;border-radius:10px;padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer;width:100%}.btn-primary:hover{background:#1d4ed8}`;

export default function FastBuy229() {
  const [page, setPage] = useState("accueil");
  const [genreChoisi, setGenreChoisi] = useState(null);
  const [showGenreModal, setShowGenreModal] = useState(true);
  const [produits, setProduits] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [catActive, setCatActive] = useState("Tous");
  const [search, setSearch] = useState("");
  const [panier, setPanier] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showInscription, setShowInscription] = useState(false);
  const [showPanier, setShowPanier] = useState(false);
  const [showCommande, setShowCommande] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [showProduit, setShowProduit] = useState(null);
  const [selectedVariante, setSelectedVariante] = useState(null);
  const [showContactAdmin, setShowContactAdmin] = useState(false);
  const [adminOk, setAdminOk] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showGererClients, setShowGererClients] = useState(false);
  const [clientTrouve, setClientTrouve] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showGererProduits, setShowGererProduits] = useState(false);
  const [produitEdit, setProduitEdit] = useState(null);
  const [editForm, setEditForm] = useState({ price: "", etat: "" });
  const [loginForm, setLoginForm] = useState({ identifiant: "", motDePasse: "" });
  const [inscForm, setInscForm] = useState({ prenom: "", nom: "", email: "", telephone: "", date_naissance: "", mot_de_passe: "", confirmer: "" });
  const [authError, setAuthError] = useState("");
  const [formCmd, setFormCmd] = useState({ nom: "", email: "", telephone: "", numeroAppel: "", ville: "", quartier: "", codePromo: "" });
  const [captureFile, setCaptureFile] = useState(null);
  const [newProduct, setNewProduct] = useState({ title: "", description: "", price: 0, etat: "Neuf", category: "Vêtements", genre: "Homme" });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [newVariante, setNewVariante] = useState({ couleur: "", taille: "", nbrPieces: "", prix: "" });
  const [newMdpClient, setNewMdpClient] = useState("");
  const [commandesClient, setCommandesClient] = useState([]);
  const [messageAuClient, setMessageAuClient] = useState("");
  const [showPassword, setShowPassword] = useState({});

  const togglePassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    const savedGenre = localStorage.getItem("fastbuy_genre");
    const savedClient = localStorage.getItem("fastbuy_client");
    const savedPanier = localStorage.getItem("fastbuy_panier");
    if (savedGenre) { setGenreChoisi(savedGenre); setShowGenreModal(false); }
    if (savedClient) setClient(JSON.parse(savedClient));
    if (savedPanier) setPanier(JSON.parse(savedPanier));
    chargerProduits();
    if (typeof window !== "undefined" && window.location.search.includes("page=admin")) {
      setPage("admin");
      setShowGenreModal(false);
    }
  }, []);

  useEffect(() => { localStorage.setItem("fastbuy_panier", JSON.stringify(panier)); }, [panier]);

  const chargerProduits = async () => { const { data } = await supabase.from("produits").select("*").order("created_at", { ascending: false }); if (data) setProduits(data); };
  const chargerCommandes = async () => { const { data } = await supabase.from("commandes").select("*").order("created_at", { ascending: false }); if (data) setCommandes(data); };
  const chargerClients = async () => { const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false }); if (data) setClients(data); };

  const getImageUrl = (path) => { if (!path) return null; if (path.startsWith("http")) return path; return `https://nuhpdqioggxznceqvpvx.supabase.co/storage/v1/object/public/produits/${path}`; };

  const produitsFiltres = produits.filter(p => {
    const matchCat = catActive === "Tous" || p.category === catActive;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchGenre = !genreChoisi || genreChoisi === "Tous" || p.genre === genreChoisi;
    return matchCat && matchSearch && matchGenre;
  });

  const totalPanier = panier.reduce((s, i) => s + i.price * i.qty, 0);
  const calculerTotalFinal = (ville, codePromo) => {
    let total = totalPanier;
    
    // Réduction 10% si code promo correct
    if (codePromo && client?.prenom) {
      if (codePromo.toLowerCase() === (client.prenom + "10").toLowerCase()) {
        total = total * 0.9;
      }
    }
    
    // Frais livraison si total < 20000
    if (total < 20000 && ville) {
      total += FRAIS_LIVRAISON[ville] || 0;
    }
    
    return Math.round(total);
  };
  
  const totalFinal = calculerTotalFinal(formCmd.ville, formCmd.codePromo);

  const choisirGenre = (genre) => { setGenreChoisi(genre); localStorage.setItem("fastbuy_genre", genre); setShowGenreModal(false); };
  const ajouterAuPanier = (prod, variante = null) => { 
    if (!client) { setShowLogin(true); return; } 
    const varianteKey = variante ? `${variante.couleur}-${variante.taille}-${variante.nbrPieces}` : "novar";
    const key = `${prod.id}-${varianteKey}`; 
    setPanier(prev => { 
      const ex = prev.find(i => i.key === key); 
      if (ex) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i); 
      return [...prev, { ...prod, key, qty: 1, variante }]; 
    }); 
    setShowProduit(null); 
    setSelectedVariante(null); 
  };

  const inscrire = async () => {
    setAuthError("");
    if (!inscForm.prenom || !inscForm.nom || !inscForm.email || !inscForm.telephone || !inscForm.date_naissance || !inscForm.mot_de_passe) { setAuthError("Remplis tous!"); return; }
    if (inscForm.mot_de_passe !== inscForm.confirmer) { setAuthError("MDP ≠"); return; }
    
    let { data: emailExist } = await supabase.from("users").select("id").eq("email", inscForm.email).maybeSingle();
    if (emailExist) { setAuthError("📧 Email existe!"); return; }
    
    let { data: telExist } = await supabase.from("users").select("id").eq("telephone", inscForm.telephone).maybeSingle();
    if (telExist) { setAuthError("📱 Tel existe!"); return; }
    
    const { data, error } = await supabase.from("users").insert([{ prenom: inscForm.prenom, nom: `${inscForm.prenom} ${inscForm.nom}`, email: inscForm.email, telephone: inscForm.telephone, date_naissance: inscForm.date_naissance, mot_de_passe: inscForm.mot_de_passe }]).select().single();
    if (error) { setAuthError("Erreur"); return; }
    const user = { id: data.id, prenom: inscForm.prenom, nom: data.nom, email: data.email, telephone: data.telephone, premiereCommande: true };
    setClient(user);
    localStorage.setItem("fastbuy_client", JSON.stringify(user));
    alert(`🎉 Bienvenue ${inscForm.prenom}!\n\n🎁 Code promo 1ère commande:\n${inscForm.prenom}10\n(-10% sur votre commande)`);
    setShowInscription(false);
  };

  const connecter = async () => {
    setAuthError("");
    let { data } = await supabase.from("users").select("*").eq("email", loginForm.identifiant).maybeSingle();
    if (!data) ({ data } = await supabase.from("users").select("*").eq("telephone", loginForm.identifiant).maybeSingle());
    if (!data) { setAuthError("Pas trouvé"); return; }
    if (data.mot_de_passe !== loginForm.motDePasse) { setAuthError("MDP faux"); return; }
    const prenom = data.nom.split(" ")[0];
    const user = { id: data.id, prenom, nom: data.nom, email: data.email, telephone: data.telephone };
    setClient(user);
    localStorage.setItem("fastbuy_client", JSON.stringify(user));
    setShowLogin(false);
    setLoginForm({ identifiant: "", motDePasse: "" });
  };

  const envoyerCommande = async () => {
    if (!formCmd.nom || !formCmd.email || !formCmd.telephone || !formCmd.ville || !formCmd.quartier) { alert("Remplis tous!"); return; }
    if (panier.length === 0) { alert("Panier vide!"); return; }
    if (!captureFile) { alert("Capture requise!"); return; }
    setLoading(true);
    
    try {
      let capturePath = null;
      if (captureFile) {
        const fileName = `cap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from("produits")
          .upload(fileName, captureFile, { upsert: true });
        
        if (uploadError) {
          console.error("Upload capture error:", uploadError);
          alert("Erreur capture: " + uploadError.message);
          setLoading(false);
          return;
        }
        capturePath = fileName;
      }
      
      const num = "CMD-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      const { error: insertError } = await supabase.from("commandes").insert([{
        numero: num,
        nom: formCmd.nom,
        email: formCmd.email,
        telephone: formCmd.telephone,
        numeroAppel: formCmd.numeroAppel,
        ville: formCmd.ville,
        quartier: formCmd.quartier,
        articles: JSON.stringify(panier),
        total: totalPanier,
        totalFinal,
        statut: "En attente",
        paiement: "En attente",
        capture: capturePath,
        user_id: client?.id
      }]);
      
      if (insertError) {
        alert("Erreur commande: " + insertError.message);
        setLoading(false);
        return;
      }
      
      setShowConfirm({ numero: num, totalFinal, ville: formCmd.ville });
      setPanier([]);
      setShowCommande(false);
      setLoading(false);
    } catch (e) {
      console.error("Exception:", e);
      alert("Erreur: " + e.message);
      setLoading(false);
    }
  };

  const ajouterVariante = () => {
    if (!newVariante.couleur || !newVariante.taille || !newVariante.nbrPieces || !newVariante.prix) { alert("Remplis tous!"); return; }
    setVariantes([...variantes, { ...newVariante, prix: parseInt(newVariante.prix), nbrPieces: parseInt(newVariante.nbrPieces) }]);
    setNewVariante({ couleur: "", taille: "", nbrPieces: "", prix: "" });
  };

  const ajouterProduit = async () => {
    if (!newProduct.title) { alert("Titre requis!"); return; }
    if (variantes.length === 0) { alert("Ajoute au moins une variante!"); return; }
    if (imageFiles.length === 0) { alert("Ajoute au moins une image!"); return; }
    setLoading(true);
    try {
      let imagePaths = [];
      
      // Upload toutes les images
      for (const file of imageFiles) {
        const fileName = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from("produits")
          .upload(fileName, file, { upsert: true });
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert("Erreur upload: " + uploadError.message);
          setLoading(false);
          return;
        }
        imagePaths.push(fileName);
      }
      
      const prodData = { 
        ...newProduct, 
        price: variantes[0].prix,
        image: imagePaths[0], 
        images: JSON.stringify(imagePaths),
        variantes: JSON.stringify(variantes)
      };
      
      const { error: insertError } = await supabase.from("produits").insert([prodData]);
      if (insertError) {
        alert("Erreur création: " + insertError.message);
        setLoading(false);
        return;
      }
      
      alert("Produit créé!");
      await chargerProduits();
      setShowAddProduct(false);
      setNewProduct({ title: "", description: "", etat: "Neuf", category: "Vêtements", genre: "Homme" });
      setImageFiles([]); setImagePreviews([]);
      setVariantes([]);
      setLoading(false);
    } catch (e) {
      console.error("Exception:", e);
      alert("Erreur: " + e.message);
      setLoading(false);
    }
  };

  const supprimerProduit = async (produitId) => {
    if (!confirm("Confirmer la suppression?")) return;
    setLoading(true);
    try {
      await supabase.from("produits").delete().eq("id", produitId);
      alert("Produit supprimé!");
      await chargerProduits();
      setProduitEdit(null);
    } catch (e) {
      alert("Erreur: " + e.message);
    }
    setLoading(false);
  };

  const modifierProduit = async (produitId) => {
    if (!editForm.price || !editForm.etat) { alert("Remplis tous!"); return; }
    setLoading(true);
    try {
      await supabase.from("produits").update({ price: parseInt(editForm.price), etat: editForm.etat }).eq("id", produitId);
      alert("Produit modifié!");
      await chargerProduits();
      setProduitEdit(null);
      setEditForm({ price: "", etat: "" });
    } catch (e) {
      alert("Erreur: " + e.message);
    }
    setLoading(false);
  };

  const chargerCommandesClient = async (clientId) => {
    try {
      const { data } = await supabase.from("commandes").select("*").eq("user_id", clientId);
      if (data) setCommandesClient(data);
    } catch (e) {
      console.error(e);
    }
  };

  const supprimerClient = async (clientId) => {
    if (!confirm("Confirmer?")) return;
    setLoading(true);
    try {
      await supabase.from("users").delete().eq("id", clientId);
      alert("Supprimé!");
      await chargerClients();
      setClientTrouve(null);
    } catch (e) {
      alert("Erreur: " + e.message);
    }
    setLoading(false);
  };

  const changerMdpClient = async (clientId) => {
    if (!newMdpClient || newMdpClient.length < 8) { alert("Min 8 chars!"); return; }
    setLoading(true);
    try {
      await supabase.from("users").update({ mot_de_passe: newMdpClient }).eq("id", clientId);
      alert("OK!");
      setNewMdpClient("");
    } catch (e) {
      alert("Erreur: " + e.message);
    }
    setLoading(false);
  };

  if (page === "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        <style>{globalStyles}</style>
        {!adminOk ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 400 }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, textAlign: "center", marginBottom: "2rem" }}>Admin</h1>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <input type={showPassword.adminPwd ? "text" : "password"} value={adminPwd} onChange={e => setAdminPwd(e.target.value)} placeholder="Mot de passe" style={{ paddingRight: 40 }} />
                <button onClick={() => togglePassword("adminPwd")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
                  {showPassword.adminPwd ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => { if (adminPwd === ADMIN_PWD) { setAdminOk(true); chargerCommandes(); chargerClients(); } else { alert("Faux!"); setAdminPwd(""); } }}>Accéder</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Admin</h1>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn-primary" style={{ width: "auto", padding: "10px 20px" }} onClick={() => { setShowAddProduct(true); setVariantes([]); }}>Ajouter Produit</button>
                <button className="btn-primary" style={{ width: "auto", padding: "10px 20px", background: "#f59e0b" }} onClick={() => { setShowGererProduits(true); }}>Gérer Produits</button>
                <button className="btn-primary" style={{ width: "auto", padding: "10px 20px", background: "#10b981" }} onClick={() => { setShowGererClients(true); chargerClients(); }}>Gérer Clients</button>
                <button onClick={() => { setAdminOk(false); setAdminPwd(""); }} style={{ padding: "10px 18px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>Déco</button>
              </div>
            </div>
          </div>
        )}

        {showAddProduct && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddProduct(false)}>
            <div className="modal" style={{ maxWidth: "600px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Ajouter Produit</h2>
              <input value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} placeholder="Titre" style={{ marginBottom: 12 }} />
              <textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Description" style={{ marginBottom: 12, resize: "vertical" }} rows={3} />
              <div style={{ fontSize: 11, color: "#666", marginBottom: 12, padding: "8px", background: "#f0f0f0", borderRadius: 6 }}>ℹ️ Le prix principal est défini par la première variante</div>
              <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={{ marginBottom: 12 }}>
                {CATEGORIES.filter(c => c !== "Tous").map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={newProduct.genre} onChange={e => setNewProduct({ ...newProduct, genre: e.target.value })} style={{ marginBottom: 12 }}>
                <option>Homme</option>
                <option>Femme</option>
                <option>Unisexe</option>
              </select>
              <select value={newProduct.etat} onChange={e => setNewProduct({ ...newProduct, etat: e.target.value })} style={{ marginBottom: 12 }}>
                <option>Neuf</option>
                <option>Bon état</option>
                <option>Occasion</option>
              </select>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Photos (min 1, max 5)</label>
                <div onClick={() => document.getElementById("photo-input").click()} style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "1rem", textAlign: "center", cursor: "pointer", background: "#fafafa", marginTop: 6 }}>
                  {imagePreviews.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                      {imagePreviews.map((p, i) => (
                        <div key={i} style={{ position: "relative", paddingBottom: "100%", background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
                          <img src={p} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                          <button onClick={e => { e.stopPropagation(); setImageFiles(imageFiles.filter((_, idx) => idx !== i)); setImagePreviews(imagePreviews.filter((_, idx) => idx !== i)); }} style={{ position: "absolute", top: 2, right: 2, background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>Cliquez pour ajouter (max 5 images)</div>
                  )}
                  <input id="photo-input" type="file" accept="image/*" multiple onChange={e => { const files = Array.from(e.target.files).slice(0, 5); setImageFiles(files); setImagePreviews(files.map(f => URL.createObjectURL(f))); }} style={{ display: "none" }} />
                </div>
              </div>

              <div style={{ marginBottom: 12, background: "#f9fafb", borderRadius: 10, padding: "1rem" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Variantes (couleur, taille, pièces, prix)</label>
                <div style={{ marginTop: 8, display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                  <input value={newVariante.couleur} onChange={e => setNewVariante({ ...newVariante, couleur: e.target.value })} placeholder="Couleur" style={{ marginBottom: 0, flex: 1, minWidth: 80 }} />
                  <input value={newVariante.taille} onChange={e => setNewVariante({ ...newVariante, taille: e.target.value })} placeholder="Taille" style={{ marginBottom: 0, flex: 1, minWidth: 60 }} />
                  <input type="number" value={newVariante.nbrPieces} onChange={e => setNewVariante({ ...newVariante, nbrPieces: e.target.value })} placeholder="Pièces" style={{ marginBottom: 0, flex: 1, minWidth: 60 }} />
                  <input type="number" value={newVariante.prix} onChange={e => setNewVariante({ ...newVariante, prix: e.target.value })} placeholder="Prix" style={{ marginBottom: 0, flex: 1, minWidth: 70 }} />
                  <button onClick={ajouterVariante} style={{ padding: "8px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, width: "auto" }}>+</button>
                </div>
                <div style={{ maxHeight: 100, overflowY: "auto" }}>
                  {variantes.map((v, i) => (
                    <div key={i} style={{ background: "#fff", padding: "6px", borderRadius: 4, marginBottom: 4, fontSize: 11, display: "flex", justifyContent: "space-between" }}>
                      <span>{v.couleur} - {v.taille} - {v.nbrPieces} pcs - {v.prix} FCFA</span>
                      <button onClick={() => setVariantes(variantes.filter((_, idx) => idx !== i))} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 3, padding: "2px 6px", cursor: "pointer", fontSize: 10 }}>X</button>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={ajouterProduit} disabled={loading} className="btn-primary">{loading ? "Création..." : "Publier"}</button>
            </div>
          </div>
        )}

        {showGererProduits && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowGererProduits(false)}>
            <div className="modal" style={{ maxWidth: "900px", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: 0 }}>
              <div style={{ background: "#f59e0b", color: "#fff", padding: "1rem", fontWeight: 700, borderRadius: "20px 20px 0 0" }}>Gérer Produits</div>
              <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                <div style={{ width: "220px", borderRight: "1px solid #e5e7eb", overflowY: "auto", background: "#f9fafb", padding: "1rem" }}>
                  {produits.map(p => (
                    <div key={p.id} onClick={() => { setProduitEdit(p); setEditForm({ price: p.price, etat: p.etat }); }} style={{ padding: "10px", borderRadius: 8, marginBottom: 8, fontSize: 11, cursor: "pointer", background: produitEdit?.id === p.id ? "#f59e0b" : "#fff", color: produitEdit?.id === p.id ? "#fff" : "#1a1a2e", border: "1px solid #e5e7eb", fontWeight: 600 }}>
                      <div>{p.title}</div>
                      <div style={{ fontSize: 9, opacity: 0.7, marginTop: 3 }}>{p.price?.toLocaleString()} FCFA</div>
                    </div>
                  ))}
                </div>
                {produitEdit ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1rem", overflowY: "auto" }}>
                    <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "2px solid #e5e7eb" }}>
                      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>{produitEdit.title}</h2>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>Cat: {produitEdit.category}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>Genre: {produitEdit.genre}</div>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>Modifier</h3>
                      <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} placeholder="Prix" style={{ marginBottom: 12 }} />
                      <select value={editForm.etat} onChange={e => setEditForm({ ...editForm, etat: e.target.value })} style={{ marginBottom: 12 }}>
                        <option>Neuf</option>
                        <option>Bon état</option>
                        <option>Occasion</option>
                      </select>
                    </div>

                    <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "1rem" }}>
                      <button className="btn-primary" style={{ background: "#10b981", marginBottom: 8 }} onClick={() => modifierProduit(produitEdit.id)} disabled={loading}>✏️ Modifier</button>
                      <button className="btn-primary" style={{ background: "#ef4444" }} onClick={() => supprimerProduit(produitEdit.id)} disabled={loading}>🗑️ Supprimer</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>Sélectionne un produit</div>
                )}
              </div>
            </div>
          </div>
        )}

        {showGererClients && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowGererClients(false)}>
            <div className="modal" style={{ maxWidth: "1000px", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0 }}>
              <div style={{ background: "#10b981", color: "#fff", padding: "1rem", fontWeight: 700, borderRadius: "20px 20px 0 0" }}>Gérer Clients</div>
              <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* LISTE CLIENTS */}
                <div style={{ width: "200px", borderRight: "1px solid #e5e7eb", overflowY: "auto", background: "#f9fafb", padding: "1rem" }}>
                  {clients.map(c => (
                    <div key={c.id} onClick={() => { setClientTrouve(c); chargerCommandesClient(c.id); }} style={{ padding: "10px", borderRadius: 8, marginBottom: 8, fontSize: 11, cursor: "pointer", background: clientTrouve?.id === c.id ? "#10b981" : "#fff", color: clientTrouve?.id === c.id ? "#fff" : "#1a1a2e", border: "1px solid #e5e7eb", fontWeight: 600 }}>
                      <div>{c.nom}</div>
                      <div style={{ fontSize: 9, opacity: 0.7, marginTop: 3 }}>{c.telephone}</div>
                    </div>
                  ))}
                </div>

                {/* INFOS CLIENT */}
                {clientTrouve ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1rem", overflowY: "auto" }}>
                    {/* HEADER */}
                    <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "2px solid #e5e7eb" }}>
                      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>{clientTrouve.nom}</h2>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>📧 {clientTrouve.email}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>📱 {clientTrouve.telephone}</div>
                    </div>

                    {/* COMMANDES */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem", color: "#1a1a2e" }}>📦 Commandes ({commandesClient.length})</h3>
                      <div style={{ background: "#f9fafb", borderRadius: 8, padding: "0.5rem", maxHeight: 180, overflowY: "auto", border: "1px solid #e5e7eb" }}>
                        {commandesClient.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "1rem", color: "#9ca3af", fontSize: 12 }}>Aucune commande</div>
                        ) : (
                          commandesClient.map(cmd => (
                            <div key={cmd.id} style={{ background: "#fff", padding: "0.75rem", borderRadius: 6, marginBottom: 8, border: "1px solid #e5e7eb" }}>
                              <div style={{ fontWeight: 600, fontSize: 11, marginBottom: 4, color: "#2563eb" }}>{cmd.numero}</div>
                              <div style={{ fontSize: 9, color: "#666", marginBottom: 3 }}>📧 {cmd.email}</div>
                              {cmd.numeroAppel && <div style={{ fontSize: 9, color: "#f59e0b", marginBottom: 3, fontWeight: 600 }}>📞 Appel: {cmd.numeroAppel}</div>}
                              <div style={{ fontSize: 10, color: "#1a1a2e", marginBottom: 3 }}>💰 Total: <strong>{cmd.totalFinal?.toLocaleString()} FCFA</strong></div>
                              <div style={{ fontSize: 10, color: "#1a1a2e", marginBottom: 3 }}>📊 Statut: <strong>{cmd.statut}</strong></div>
                              <div style={{ fontSize: 10, color: "#1a1a2e", marginBottom: 3 }}>💳 Paiement: <strong>{cmd.paiement}</strong></div>
                              {cmd.capture && <div style={{ fontSize: 10, color: "#16a34a", marginBottom: 3 }}>✅ Capture reçue</div>}
                              <details style={{ fontSize: 9, marginTop: 4 }}>
                                <summary style={{ cursor: "pointer", color: "#2563eb", fontWeight: 600 }}>Articles ({cmd.articles ? JSON.parse(cmd.articles).length : 0})</summary>
                                <div style={{ marginLeft: 12, marginTop: 4 }}>
                                  {cmd.articles && JSON.parse(cmd.articles).map((art, i) => (
                                    <div key={i} style={{ fontSize: 9, color: "#6b7280", marginBottom: 2 }}>• {art.title} x{art.qty} = {(art.price * art.qty).toLocaleString()} FCFA</div>
                                  ))}
                                </div>
                              </details>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "1rem" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", color: "#1a1a2e" }}>⚙️ Actions</h3>
                      <div style={{ position: "relative", marginBottom: 8 }}>
                        <input type={showPassword.gererClientMdp ? "text" : "password"} value={newMdpClient} onChange={e => setNewMdpClient(e.target.value)} placeholder="Nouveau mot de passe" style={{ fontSize: 12, paddingRight: 40 }} />
                        <button onClick={() => togglePassword("gererClientMdp")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>
                          {showPassword.gererClientMdp ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                      <button className="btn-primary" style={{ background: "#10b981", marginBottom: 8, fontSize: 12, padding: "10px" }} onClick={() => changerMdpClient(clientTrouve.id)} disabled={loading}>🔐 Changer MDP</button>
                      <button className="btn-primary" style={{ background: "#ef4444", fontSize: 12, padding: "10px" }} onClick={() => supprimerClient(clientTrouve.id)} disabled={loading}>🗑️ Supprimer Compte</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 14, marginBottom: 8 }}>👈</div>
                      <div>Sélectionne un client</div>
                    </div>
                  </div>
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

      <div style={{ background: "#1a1a2e", color: "#fff", padding: "8px 1.5rem", fontSize: 12, textAlign: "center", fontWeight: 600 }}>Livraison gratuite à partir de 20000 FCFA | 10% réduction 1ère commande</div>

      {showGenreModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "1rem" }}>FastBuy</h1>
            <button className="btn-primary" style={{ marginBottom: 12 }} onClick={() => choisirGenre("Homme")}>Homme</button>
            <button className="btn-primary" style={{ marginBottom: 12, background: "#ec4899" }} onClick={() => choisirGenre("Femme")}>Femme</button>
            <button className="btn-primary" style={{ background: "#8b5cf6" }} onClick={() => choisirGenre("Tous")}>Voir Tout</button>
          </div>
        </div>
      )}

      <div style={{ position: "sticky", top: 0, background: "#fff", padding: "12px 1.5rem", display: "flex", alignItems: "center", gap: 12, zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,0.1)", borderBottom: "2px solid #2563eb" }}>
        <div onClick={() => { setPage("accueil"); setCatActive("Tous"); }} style={{ cursor: "pointer", fontWeight: 800, fontSize: "1.2rem", color: "#2563eb" }}>FastBuy</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 12 }} />
        <span style={{ cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }} onClick={() => setShowPanier(true)}>Panier ({panier.reduce((s, i) => s + i.qty, 0)})</span>
        {client ? (
          <span style={{ cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }} onClick={() => { setClient(null); localStorage.removeItem("fastbuy_client"); }}>Déco</span>
        ) : (
          <span style={{ cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "#2563eb" }} onClick={() => setShowLogin(true)}>Connexion</span>
        )}
        <span style={{ cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, padding: "4px 8px", background: "#f3f4f6", borderRadius: 6 }} onClick={() => setShowGenreModal(true)}>{genreChoisi}</span>
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
            <div style={{ position: "relative", height: 250, background: "#000", marginBottom: 20 }}>
              <div style={{ display: "flex", transition: "transform 0.3s ease", transform: `translateX(-${heroIndex * 100}%)` }}>
                {produits.filter(p => !genreChoisi || genreChoisi === "Tous" || p.genre === genreChoisi).slice(0, 5).map((item, i) => (
                  <div key={i} style={{ minWidth: "100%", height: 250 }}>
                    {item.image && <img src={getImageUrl(item.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                ))}
              </div>
              <button onClick={() => setHeroIndex(heroIndex > 0 ? heroIndex - 1 : 4)} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.7)", border: "none", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}>{'<'}</button>
              <button onClick={() => setHeroIndex(heroIndex < 4 ? heroIndex + 1 : 0)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.7)", border: "none", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}>{'>'}</button>
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
                  <div key={cat} onClick={() => { setCatActive(cat); setPage("produits"); }} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", cursor: "pointer", height: 140, position: "relative" }}>
                    {premierProduit?.image ? (
                      <img src={getImageUrl(premierProduit.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#f3f4f6" }} />
                    )}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", color: "#fff", padding: "8px", fontSize: 12, fontWeight: 600 }}>{cat}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {page === "produits" && (
        <div style={{ padding: "1.5rem" }}>
          {produitsFiltres.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9ca3af" }}>Aucun</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
              {produitsFiltres.map(item => (
                <div key={item.id} onClick={() => { setShowProduit(item); setSelectedVariante(null); }} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", cursor: "pointer" }}>
                  <div style={{ height: 130, background: "#f3f4f6" }}>
                    {item.image ? <img src={getImageUrl(item.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                  </div>
                  <div style={{ padding: "8px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}>{item.title}</div>
                    <div style={{ fontWeight: 700, fontSize: 11, color: "#2563eb" }}>
                      {item.variantes 
                        ? JSON.parse(item.variantes)[0]?.prix?.toLocaleString() 
                        : item.price?.toLocaleString()
                      } FCFA
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showProduit && (
        <div className="modal-overlay" onClick={e => { e.target === e.currentTarget && setShowProduit(null); setSelectedVariante(null); }}>
          <div className="modal">
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>{showProduit.title}</h2>
            <div style={{ height: 200, background: "#f3f4f6", borderRadius: 12, marginBottom: 12, display: "flex", alignItems: "center" }}>
              {showProduit.image ? <img src={getImageUrl(showProduit.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
            </div>
            {showProduit.description && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>{showProduit.description}</div>}
            {showProduit.variantes && JSON.parse(showProduit.variantes).length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13, color: "#1a1a2e" }}>🎯 Sélectionner une variante</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {JSON.parse(showProduit.variantes).map((v, i) => (
                      <button
                      type="button"
                      key={i}
                      onClick={() => setSelectedVariante(i)}
                      style={{
                        padding: "14px 12px",
                        borderRadius: 10,
                        border: selectedVariante === i ? "3px solid #2563eb" : "2px solid #d1d5db",
                        background: selectedVariante === i ? "#eff6ff" : "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        color: selectedVariante === i ? "#1a1a2e" : "#6b7280",
                        textAlign: "center",
                        boxShadow: selectedVariante === i ? "0 4px 12px rgba(37,99,235,0.2)" : "none",
                        position: "relative"
                      }}
                    >
                      {selectedVariante === i && <div style={{ position: "absolute", top: 6, right: 6, background: "#2563eb", color: "#fff", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>✓</div>}
                      <div style={{ marginBottom: 6, fontSize: 11, color: selectedVariante === i ? "#2563eb" : "#6b7280" }}>
                        {v.couleur} • {v.taille}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: selectedVariante === i ? "#2563eb" : "#1a1a2e" }}>
                        {v.nbrPieces} pcs
                      </div>
                      <div style={{ marginTop: 6, fontSize: 11, color: "#059669", fontWeight: 700 }}>
                        {v.prix.toLocaleString()} FCFA
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button type="button" onClick={() => { if (selectedVariante === null && showProduit.variantes && JSON.parse(showProduit.variantes).length > 0) { alert("Sélectionne une variante!"); return; } const variante = selectedVariante !== null && showProduit.variantes ? JSON.parse(showProduit.variantes)[selectedVariante] : null; ajouterAuPanier({...showProduit, price: variante ? variante.prix : showProduit.price}, variante); }} className="btn-primary">{!client ? "Connexion" : "Ajouter au panier"}</button>
          </div>
        </div>
      )}

      {showContactAdmin && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowContactAdmin(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Nous Contacter</h2>
            <div style={{ background: "#eff6ff", borderRadius: 12, padding: "1.5rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1e40af", marginBottom: "0.75rem" }}>📧 Email</div>
                <a href={`mailto:${ADMIN_EMAIL}`} style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600, display: "inline-block", padding: "8px 12px", background: "#fff", borderRadius: 8 }}>
                  {ADMIN_EMAIL}
                </a>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1e40af", marginBottom: "0.75rem" }}>📱 WhatsApp</div>
                <a href={`https://wa.me/${ADMIN_WHATSAPP.replace(/\s/g, "").replace("+", "")}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#25D366", textDecoration: "none", fontWeight: 600, display: "inline-block", padding: "8px 12px", background: "#fff", borderRadius: 8 }}>
                  {ADMIN_WHATSAPP}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPanier && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPanier(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>Panier</h2>
            {panier.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af" }}>Vide</div>
            ) : (
              <>
                {panier.map(item => (
                  <div key={item.key} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{item.title}</div>
                      {item.variante && <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>🎨 {item.variante.couleur} • {item.variante.taille} • {item.variante.nbrPieces} pcs</div>}
                      <div style={{ fontSize: 12, color: "#2563eb" }}>{(item.price * item.qty).toLocaleString()} FCFA</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setPanier(prev => prev.map(i => i.key === item.key ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} style={{ width: 20, height: 20, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", borderRadius: "50%" }}>-</button>
                      <span style={{ width: 14, textAlign: "center", fontWeight: 600 }}>{item.qty}</span>
                      <button onClick={() => setPanier(prev => prev.map(i => i.key === item.key ? { ...i, qty: i.qty + 1 } : i))} style={{ width: 20, height: 20, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", borderRadius: "50%" }}>+</button>
                      <button onClick={() => setPanier(prev => prev.filter(i => i.key !== item.key))} style={{ width: 20, height: 20, border: "1px solid #ef4444", background: "#fef2f2", cursor: "pointer", borderRadius: "50%", color: "#ef4444", fontWeight: 600, fontSize: 12 }}>✕</button>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "1rem 0", borderTop: "2px solid #f3f4f6", marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ color: "#2563eb" }}>{totalFinal.toLocaleString()} FCFA</span>
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
            <input placeholder="Numéro pour appel paiement" value={formCmd.numeroAppel} onChange={e => setFormCmd({ ...formCmd, numeroAppel: e.target.value })} style={{ marginBottom: 12 }} />
            <input placeholder="Ville" value={formCmd.ville} onChange={e => setFormCmd({ ...formCmd, ville: e.target.value })} style={{ marginBottom: 12 }} />
            <input placeholder="Quartier" value={formCmd.quartier} onChange={e => setFormCmd({ ...formCmd, quartier: e.target.value })} style={{ marginBottom: 12 }} />
            <input placeholder="Code promo" value={formCmd.codePromo} onChange={e => setFormCmd({ ...formCmd, codePromo: e.target.value })} style={{ marginBottom: 12 }} />
            
            {client?.prenom && <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px", marginBottom: 12, fontSize: 11, fontWeight: 600, color: "#1e40af" }}>🎁 Code promo 1ère commande: <strong>{client.prenom}10</strong> (-10%)</div>}
            
            {formCmd.ville && FRAIS_LIVRAISON[formCmd.ville] && totalPanier < 20000 && <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "8px", marginBottom: 12, fontSize: 11, color: "#92400e" }}>🚚 Frais livraison ({formCmd.ville}): +{FRAIS_LIVRAISON[formCmd.ville].toLocaleString()} FCFA</div>}
            
            {totalPanier > 19999 && <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 8, padding: "8px", marginBottom: 12, fontSize: 11, color: "#166534" }}>🎉 Livraison GRATUITE</div>}
            
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px", marginBottom: 12, fontSize: 12 }}>Envoyer {totalFinal.toLocaleString()} FCFA à {MOMO}</div>
            <div onClick={() => document.getElementById("capture-input").click()} style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "1rem", textAlign: "center", cursor: "pointer", marginBottom: 12, background: "#fafafa", fontSize: 12 }}>
              {captureFile ? <span style={{ color: "#16a34a" }}>✅ OK</span> : <span>📸 Capture</span>}
              <input id="capture-input" type="file" accept="image/*" onChange={e => setCaptureFile(e.target.files[0])} style={{ display: "none" }} />
            </div>
            <button onClick={envoyerCommande} disabled={loading} className="btn-primary">{loading ? "..." : "Confirmer"}</button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: "center", maxWidth: "500px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 12 }}>Commande Confirmée!</h2>
            <div style={{ background: "#eff6ff", borderRadius: 10, padding: "1rem", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: "#2563eb", fontSize: "1.1rem", marginBottom: 4 }}>Numéro: {showConfirm.numero}</div>
              <div style={{ fontSize: 12, color: "#1e40af" }}>Vous recevrez un email de confirmation</div>
            </div>
            
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "1rem", marginBottom: 12, textAlign: "left", fontSize: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: "#1a1a2e" }}>📦 Facture:</div>
              {panier.map((item, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#6b7280" }}>
                    <span>{item.title} x{item.qty}</span>
                    <strong>{(item.price * item.qty).toLocaleString()} FCFA</strong>
                  </div>
                  {item.variante && <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 6, paddingLeft: 12 }}>🎨 {item.variante.couleur} • {item.variante.taille} • {item.variante.nbrPieces} pcs</div>}
                </div>
              ))}
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 8, marginTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#2563eb" }}>
                <span>Total:</span>
                <span>{showConfirm.totalFinal?.toLocaleString()} FCFA</span>
              </div>
            </div>
            
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem", marginBottom: 12, fontSize: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6, color: "#92400e" }}>💳 Envoyer à:</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f59e0b", marginBottom: 4 }}>{MOMO}</div>
              <div style={{ fontSize: 11, color: "#b45309" }}>Montant: {showConfirm.totalFinal?.toLocaleString()} FCFA</div>
            </div>
            
            <button className="btn-primary" onClick={() => { setShowConfirm(null); setFormCmd({ nom: "", email: "", telephone: "", numeroAppel: "", ville: "", quartier: "", codePromo: "" }); }}>Fermer</button>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLogin(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Connexion</h2>
            <input placeholder="Email ou tel" value={loginForm.identifiant} onChange={e => setLoginForm({ ...loginForm, identifiant: e.target.value })} style={{ marginBottom: 12 }} />
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input type={showPassword.login ? "text" : "password"} placeholder="MDP" value={loginForm.motDePasse} onChange={e => setLoginForm({ ...loginForm, motDePasse: e.target.value })} style={{ paddingRight: 40 }} />
              <button onClick={() => togglePassword("login")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
                {showPassword.login ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {authError && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 12 }}>{authError}</div>}
            <button className="btn-primary" onClick={connecter} style={{ marginBottom: 12 }}>Connexion</button>
            <div style={{ textAlign: "center", fontSize: 12 }}>
              <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => { setShowLogin(false); setShowInscription(true); }}>S'inscrire</span>
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
            <input placeholder="JJ/MM/AAAA" value={inscForm.date_naissance} onChange={e => setInscForm({ ...inscForm, date_naissance: e.target.value })} style={{ marginBottom: 12 }} maxLength={10} />
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input type={showPassword.inscMdp ? "text" : "password"} placeholder="MDP" value={inscForm.mot_de_passe} onChange={e => setInscForm({ ...inscForm, mot_de_passe: e.target.value })} style={{ paddingRight: 40 }} />
              <button onClick={() => togglePassword("inscMdp")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
                {showPassword.inscMdp ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input type={showPassword.inscConf ? "text" : "password"} placeholder="Confirmer" value={inscForm.confirmer} onChange={e => setInscForm({ ...inscForm, confirmer: e.target.value })} style={{ paddingRight: 40 }} />
              <button onClick={() => togglePassword("inscConf")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
                {showPassword.inscConf ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {authError && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 12 }}>{authError}</div>}
            <button className="btn-primary" onClick={inscrire}>Créer</button>
          </div>
        </div>
      )}
    </div>
  );
}