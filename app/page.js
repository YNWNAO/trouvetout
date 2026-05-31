"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const CATEGORIES = ["Tous", "Vêtements", "Chaussures", "Parfums", "Téléphones", "Sacs", "Bijoux", "Ordinateurs", "Accessoires"];
const ADMIN_PWD = "N-beat3140";
const MOMO = "+229 57577895";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f8f9fa; color: #1a1a2e; }
  input, select, textarea { width: 100%; padding: 12px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: 'Inter', sans-serif; background: #fff; color: #1a1a2e; outline: none; }
  input:focus, select:focus, textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); overflow-y: auto; }
  .modal { background: #fff; border-radius: 20px; padding: 2rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
  .btn-primary { background: #2563eb; color: #fff; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; }
  .btn-primary:hover { background: #1d4ed8; }
`;

export default function FastBuy229() {
  // ============ STATES ============
  const [page, setPage] = useState("accueil");
  const [produits, setProduits] = useState([]);
  const [catActive, setCatActive] = useState("Tous");
  const [search, setSearch] = useState("");
  const [panier, setPanier] = useState([]);
  const [client, setClient] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showInscription, setShowInscription] = useState(false);
  const [showPanier, setShowPanier] = useState(false);
  const [showProduit, setShowProduit] = useState(null);
  const [showCommande, setShowCommande] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [photoChoisie, setPhotoChoisie] = useState(0);
  const [couleurChoisie, setCouleurChoisie] = useState("");
  const [tailleChoisie, setTailleChoisie] = useState("");
  const [adminOk, setAdminOk] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [nouvVar, setNouvVar] = useState({ couleur: "", taille: "", prix: "", stock: "disponible" });
  const [newProduct, setNewProduct] = useState({ title: "", description: "", etat: "Neuf", category: "Vêtements", plage_livraison: "1-2 semaines" });
  const [formCmd, setFormCmd] = useState({ nom: "", email: "", telephone: "", ville: "", adresse: "" });
  const [loginForm, setLoginForm] = useState({ identifiant: "", motDePasse: "" });
  const [inscForm, setInscForm] = useState({ prenom: "", nom: "", email: "", telephone: "", date_naissance: "", mot_de_passe: "", confirmer: "" });
  const [authError, setAuthError] = useState("");
  const [showPwdLogin, setShowPwdLogin] = useState(false);
  const [showPwdInsc, setShowPwdInsc] = useState(false);
  const [showPwdAdmin, setShowPwdAdmin] = useState(false);
  const [captureFile, setCaptureFile] = useState(null);
  const [codePromo, setCodePromo] = useState("");
  const [reduction, setReduction] = useState(0);
  const [loading, setLoading] = useState(false);

  const pwdButtonStyle = {
    position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#374151",
    padding: "4px 8px", zIndex: 10, lineHeight: 1
  };

  // ============ EFFECTS ============
  useEffect(() => {
    const savedClient = localStorage.getItem("fastbuy_client");
    if (savedClient) setClient(JSON.parse(savedClient));
    const savedPanier = localStorage.getItem("fastbuy_panier");
    if (savedPanier) setPanier(JSON.parse(savedPanier));
    
    if (typeof window !== "undefined" && window.location.search.includes("page=admin")) {
      setPage("admin");
    }
    
    chargerProduits();
  }, []);

  useEffect(() => {
    localStorage.setItem("fastbuy_panier", JSON.stringify(panier));
  }, [panier]);

  // ============ FUNCTIONS ============
  const chargerProduits = async () => {
    try {
      const { data } = await supabase.from("produits").select("*").order("created_at", { ascending: false });
      if (data) setProduits(data);
    } catch (e) {
      console.error("Erreur produits:", e);
    }
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
    if (mot_de_passe !== confirmer) { setAuthError("Mots de passe différents !"); return; }
    if (mot_de_passe.length < 8) { setAuthError("Min 8 caractères !"); return; }
    const { data: exist } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (exist) { setAuthError("Email déjà utilisé !"); return; }
    const { data, error } = await supabase.from("users").insert([{ nom: `${prenom} ${nom}`, email, telephone, date_naissance, mot_de_passe }]).select().single();
    if (error) { setAuthError("Erreur inscription !"); return; }
    const user = { id: data.id, nom: data.nom, email: data.email, telephone: data.telephone };
    setClient(user);
    localStorage.setItem("fastbuy_client", JSON.stringify(user));
    setShowInscription(false);
    setInscForm({ prenom: "", nom: "", email: "", telephone: "", date_naissance: "", mot_de_passe: "", confirmer: "" });
  };

  const connecter = async () => {
    setAuthError("");
    const { identifiant, motDePasse } = loginForm;
    if (!identifiant || !motDePasse) { setAuthError("Remplis tous les champs !"); return; }
    let { data } = await supabase.from("users").select("*").eq("email", identifiant).maybeSingle();
    if (!data) {
      ({ data } = await supabase.from("users").select("*").eq("telephone", identifiant).maybeSingle());
    }
    if (!data) { setAuthError("❌ Compte non trouvé !"); return; }
    if (data.mot_de_passe !== motDePasse) { setAuthError("❌ MDP incorrect !"); return; }
    const user = { id: data.id, nom: data.nom, email: data.email, telephone: data.telephone };
    setClient(user);
    localStorage.setItem("fastbuy_client", JSON.stringify(user));
    setShowLogin(false);
    setLoginForm({ identifiant: "", motDePasse: "" });
  };

  const envoyerCommande = async () => {
    const { nom, email, telephone, ville, adresse } = formCmd;
    if (!nom || !email || !telephone || !ville || !adresse) { alert("Remplis tous !"); return; }
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
          if (uploadError) { alert("❌ Erreur upload"); setLoading(false); return; }
          imagePaths.push(fn);
        }
      }
      const prixBase = Math.min(...variantes.map(v => parseInt(v.prix) || 0));
      const { data, error: insertError } = await supabase.from("produits").insert([{
        ...newProduct, price: prixBase, image: imagePaths[0] || null, images: imagePaths,
        variantes: JSON.stringify(variantes.map(({ id, ...v }) => v))
      }]).select();
      if (insertError || !data) { alert("❌ Erreur insertion !"); setLoading(false); return; }
      alert("✅ Produit créé !");
      await chargerProduits();
      setShowAddProduct(false);
      setNewProduct({ title: "", description: "", etat: "Neuf", category: "Vêtements", plage_livraison: "1-2 semaines" });
      setImageFiles([]); setImagePreviews([]); setVariantes([]);
      setLoading(false);
    } catch (e) {
      alert("❌ Erreur: " + e.message);
      setLoading(false);
    }
  };

  // ============ ADMIN ============
  if (page === "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
        <style>{globalStyles}</style>
        {!adminOk ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 400, boxShadow: "0 4px 30px rgba(0,0,0,0.1)" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, textAlign: "center", marginBottom: "2rem" }}>🔐 Admin</h1>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <input type={showPwdAdmin ? "text" : "password"} value={adminPwd} onChange={e => setAdminPwd(e.target.value)} placeholder="MDP" style={{ width: "100%", padding: "12px 40px 12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10 }} />
                <button type="button" onClick={() => setShowPwdAdmin(p => !p)} style={pwdButtonStyle}>{showPwdAdmin ? "🙈" : "👁️"}</button>
              </div>
              <button className="btn-primary" onClick={() => { if (adminPwd === ADMIN_PWD) { setAdminOk(true); } else { alert("Incorrect !"); setAdminPwd(""); } }}>Accéder</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginBottom: "2rem" }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>⚙️ Admin</h1>
              <button className="btn-primary" style={{ width: "auto", padding: "10px 20px" }} onClick={() => setShowAddProduct(true)}>+ Produit</button>
            </div>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>🛍️ Produits ({produits.length})</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
              {produits.map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ height: 80, background: "#f3f4f6", overflow: "hidden" }}>
                    {(p.images?.[0] || p.image) ? <img src={getImageUrl(p.images?.[0] || p.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div>📦</div>}
                  </div>
                  <div style={{ padding: "8px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{p.title?.slice(0, 12)}</div>
                    <button onClick={async () => { if (confirm("Supprimer?")) { await supabase.from("produits").delete().eq("id", p.id); await chargerProduits(); } }} style={{ width: "100%", padding: "3px 0", background: "#fef2f2", border: "none", color: "#ef4444", borderRadius: 4, fontSize: 9, cursor: "pointer" }}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showAddProduct && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddProduct(false)}>
            <div className="modal">
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Ajouter produit</h2>
              <input value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} placeholder="Titre *" style={{ marginBottom: 12 }} />
              <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={{ marginBottom: 12 }}>
                {CATEGORIES.filter(c => c !== "Tous").map(c => <option key={c}>{c}</option>)}
              </select>
              <div onClick={() => document.getElementById("photo-input").click()} style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "1rem", textAlign: "center", cursor: "pointer", marginBottom: 12, background: "#fafafa" }}>
                {imagePreviews.length > 0 ? (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                    {imagePreviews.map((p, i) => <img key={i} src={p} alt="" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }} />)}
                  </div>
                ) : <div style={{ fontSize: 12, color: "#9ca3af" }}>📷 Clique</div>}
                <input id="photo-input" type="file" accept="image/*" multiple onChange={e => {
                  const files = Array.from(e.target.files).slice(0, 5);
                  setImageFiles(files);
                  setImagePreviews(files.map(f => URL.createObjectURL(f)));
                }} style={{ display: "none" }} />
              </div>

              <div style={{ background: "#f0f9ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "1rem", marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: "#1e40af" }}>📦 Variantes</div>
                <input placeholder="Couleur *" value={nouvVar.couleur} onChange={e => setNouvVar({ ...nouvVar, couleur: e.target.value })} style={{ marginBottom: 10 }} />
                <input placeholder="Taille *" value={nouvVar.taille} onChange={e => setNouvVar({ ...nouvVar, taille: e.target.value })} style={{ marginBottom: 10 }} />
                <input type="number" placeholder="Prix *" value={nouvVar.prix} onChange={e => setNouvVar({ ...nouvVar, prix: e.target.value })} style={{ marginBottom: 10 }} />
                <button onClick={() => {
                  if (!nouvVar.couleur || !nouvVar.taille || !nouvVar.prix) { alert("Obligatoire!"); return; }
                  setVariantes([...variantes, { ...nouvVar, id: Date.now() }]);
                  setNouvVar({ couleur: "", taille: "", prix: "", stock: "disponible" });
                }} style={{ width: "100%", padding: "10px 0", background: "#dbeafe", border: "1px solid #93c5fd", color: "#1e40af", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>+ Ajouter</button>
                {variantes.length > 0 && (
                  <div style={{ marginTop: 12, maxHeight: 150, overflowY: "auto" }}>
                    {variantes.map(v => (
                      <div key={v.id} style={{ background: "#fff", borderRadius: 8, padding: "8px", marginBottom: 6, display: "flex", justifyContent: "space-between", fontSize: 12, border: "1px solid #e5e7eb" }}>
                        <span><strong>{v.couleur} • {v.taille}</strong> → {v.prix} FCFA</span>
                        <button onClick={() => setVariantes(variantes.filter(vv => vv.id !== v.id))} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", padding: "2px 6px", borderRadius: 4, cursor: "pointer", fontSize: 10 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={ajouterProduit} disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.5 : 1 }}>
                {loading ? "..." : "✅ Publier"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============ CLIENT ============
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingBottom: 80 }}>
      <style>{globalStyles}</style>

      {/* NAVBAR BLEU */}
      <div style={{ position: "sticky", top: 0, background: "#2563eb", color: "#fff", padding: "12px 1.5rem", display: "flex", alignItems: "center", gap: 12, zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <div onClick={() => setPage("accueil")} style={{ cursor: "pointer", fontWeight: 800, fontSize: "1.2rem" }}>FastBuy</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "none", fontSize: 13, background: "#fff", color: "#1a1a2e" }} />
        <span style={{ cursor: "pointer", fontSize: "1.5rem" }} onClick={() => setShowPanier(true)}>🛒 {panier.reduce((s, i) => s + i.qty, 0)}</span>
        {client ? (
          <span style={{ cursor: "pointer", fontSize: "1.2rem" }} onClick={() => { setClient(null); localStorage.removeItem("fastbuy_client"); }}>👤</span>
        ) : (
          <span style={{ cursor: "pointer", fontSize: "1.2rem" }} onClick={() => setShowLogin(true)}>🔑</span>
        )}
      </div>

      {/* CATEGORIES */}
      <div style={{ background: "#fff", padding: "10px 1.5rem", display: "flex", gap: 8, overflowX: "auto", borderBottom: "1px solid #e5e7eb" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCatActive(cat)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", background: catActive === cat ? "#2563eb" : "#f3f4f6", color: catActive === cat ? "#fff" : "#6b7280", border: "none" }}>
            {cat}
          </button>
        ))}
      </div>

      {page === "accueil" && (
        <>
          {/* HERO */}
          <div style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "#fff", padding: "2.5rem 1.5rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 8 }}>Trouvez votre style</h1>
            <p style={{ fontSize: 14, marginBottom: "1.5rem", opacity: 0.9 }}>Vêtements, chaussures et accessoires</p>
            <button onClick={() => setPage("produits")} style={{ background: "#fff", color: "#2563eb", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Voir les produits</button>
          </div>

          {/* CATEGORIES GRILLE */}
          <div style={{ padding: "2rem 1.5rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Catégories</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
              {CATEGORIES.filter(c => c !== "Tous").map(cat => {
                const catProduits = produits.filter(p => p.category === cat);
                const emojis = { Vêtements: "👕", Chaussures: "👞", Parfums: "💐", Téléphones: "📱", Sacs: "👜", Bijoux: "💍", Ordinateurs: "💻", Accessoires: "⌚" };
                return (
                  <div key={cat} onClick={() => { setCatActive(cat); setPage("produits"); }} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", marginBottom: 6 }}>{emojis[cat]}</div>
                      <div style={{ fontWeight: 600, fontSize: 11 }}>{cat}</div>
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>({catProduits.length})</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NOUVEAUTES */}
          {produits.length > 0 && (
            <div style={{ padding: "0 1.5rem 2rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Nouveautés 🔥</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                {produits.slice(0, 4).map(item => (
                  <div key={item.id} onClick={() => { setShowProduit(item); setPhotoChoisie(0); setCouleurChoisie(""); setTailleChoisie(""); }} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer" }}>
                    <div style={{ height: 130, background: "#f3f4f6", overflow: "hidden" }}>
                      {(item.images?.[0] || item.image) ? <img src={getImageUrl(item.images?.[0] || item.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div>📦</div>}
                    </div>
                    <div style={{ padding: "10px" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{item.title?.slice(0, 20)}</div>
                      <div style={{ fontWeight: 700, fontSize: 12, color: "#2563eb" }}>{item.price?.toLocaleString()} FCFA</div>
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
            <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>🔍 Aucun produit</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {produitsFiltres.map(item => (
                <div key={item.id} onClick={() => { setShowProduit(item); setPhotoChoisie(0); setCouleurChoisie(""); setTailleChoisie(""); }} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer" }}>
                  <div style={{ height: 130, background: "#f3f4f6", overflow: "hidden" }}>
                    {(item.images?.[0] || item.image) ? <img src={getImageUrl(item.images?.[0] || item.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div>📦</div>}
                  </div>
                  <div style={{ padding: "10px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#2563eb" }}>{item.price?.toLocaleString()} FCFA</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL PRODUIT */}
      {showProduit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowProduit(null)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{showProduit.title}</h2>
              <span onClick={() => setShowProduit(null)} style={{ cursor: "pointer", fontSize: 20 }}>×</span>
            </div>
            {(() => {
              const photos = showProduit.images?.length > 0 ? showProduit.images : showProduit.image ? [showProduit.image] : [];
              return (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ height: 200, background: "#f3f4f6", borderRadius: 12, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                    {photos.length > 0 ? <img src={getImageUrl(photos[photoChoisie])} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "2rem" }}>📦</span>}
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
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12 }}>🚚 {showProduit.plage_livraison} · {showProduit.etat}</div>
            
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
              
              let prixActuel = showProduit.price;
              if (couleurChoisie && tailleChoisie) {
                const varTrouvee = variantes.find(v => v.couleur === couleurChoisie && v.taille === tailleChoisie);
                if (varTrouvee) prixActuel = parseInt(varTrouvee.prix);
              }
              
              return (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: "#1a1a2e" }}>🎨 Couleur</div>
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
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: "#1a1a2e" }}>📏 Taille</div>
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
                  
                  {couleurChoisie && tailleChoisie && (
                    <div style={{ background: "#f0f9ff", borderRadius: 10, padding: "12px", marginBottom: "1rem", fontWeight: 700, fontSize: 14, color: "#2563eb" }}>
                      {prixActuel?.toLocaleString()} FCFA
                    </div>
                  )}
                </>
              );
            })()}
            
            <button onClick={() => ajouterAuPanier(showProduit, couleurChoisie, tailleChoisie)} disabled={!couleurChoisie || !tailleChoisie} className="btn-primary" style={{ opacity: (!couleurChoisie || !tailleChoisie) ? 0.5 : 1 }}>
              {!client ? "🔐 Connecte-toi" : (!couleurChoisie || !tailleChoisie) ? "Choisis couleur + taille" : "🛒 Ajouter"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL PANIER */}
      {showPanier && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPanier(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>🛒 Panier</h2>
            {panier.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: "1rem" }}>Vide</div>
            ) : (
              <>
                {panier.map(item => (
                  <div key={item.key} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
                      {(item.images?.[0] || item.image) ? <img src={getImageUrl(item.images?.[0] || item.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div>📦</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{item.title} {item.couleurChoisie && <span style={{ color: "#6b7280" }}>• {item.couleurChoisie}</span>} {item.tailleChoisie && <span style={{ color: "#6b7280" }}>• {item.tailleChoisie}</span>}</div>
                      <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 600, marginTop: 3 }}>{(item.price * item.qty).toLocaleString()} FCFA</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setPanier(prev => prev.map(i => i.key === item.key ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} style={{ width: 20, height: 20, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", borderRadius: "50%", fontSize: 10 }}>−</button>
                      <span style={{ fontWeight: 600, width: 14, textAlign: "center", fontSize: 12 }}>{item.qty}</span>
                      <button onClick={() => setPanier(prev => prev.map(i => i.key === item.key ? { ...i, qty: i.qty + 1 } : i))} style={{ width: 20, height: 20, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", borderRadius: "50%", fontSize: 10 }}>+</button>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "1rem 0", borderTop: "2px solid #f3f4f6", marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ fontSize: 15, color: "#2563eb" }}>{totalFinal.toLocaleString()} FCFA</span>
                  </div>
                  <button className="btn-primary" onClick={() => { setShowPanier(false); setShowCommande(true); }}>Commander</button>
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
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>Commande</h2>
            <input placeholder="Nom" value={formCmd.nom} onChange={e => setFormCmd({ ...formCmd, nom: e.target.value })} style={{ marginBottom: 10 }} />
            <input placeholder="Email" value={formCmd.email} onChange={e => setFormCmd({ ...formCmd, email: e.target.value })} style={{ marginBottom: 10 }} />
            <input placeholder="Téléphone" value={formCmd.telephone} onChange={e => setFormCmd({ ...formCmd, telephone: e.target.value })} style={{ marginBottom: 10 }} />
            <input placeholder="Ville" value={formCmd.ville} onChange={e => setFormCmd({ ...formCmd, ville: e.target.value })} style={{ marginBottom: 10 }} />
            <input placeholder="Adresse" value={formCmd.adresse} onChange={e => setFormCmd({ ...formCmd, adresse: e.target.value })} style={{ marginBottom: 12 }} />
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px", marginBottom: 12, fontSize: 12 }}>
              Envoie <strong>{totalFinal.toLocaleString()} FCFA</strong> au <strong>{MOMO}</strong>
            </div>
            <div onClick={() => document.getElementById("capture-input").click()} style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "1rem", textAlign: "center", cursor: "pointer", marginBottom: 12, background: "#fafafa" }}>
              {captureFile ? <span style={{ fontSize: 12, color: "#16a34a" }}>✅ {captureFile.name}</span> : <span style={{ fontSize: 12 }}>📎 Clique</span>}
              <input id="capture-input" type="file" accept="image/*" onChange={e => setCaptureFile(e.target.files[0])} style={{ display: "none" }} />
            </div>
            <button onClick={envoyerCommande} disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.5 : 1 }}>
              {loading ? "..." : `✅ ${totalFinal.toLocaleString()} FCFA`}
            </button>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}>Succès !</h2>
            <p style={{ color: "#6b7280", marginBottom: 12, fontSize: 13 }}>{showConfirm.nom}</p>
            <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#2563eb" }}>{showConfirm.numero}</div>
            </div>
            <button className="btn-primary" onClick={() => setShowConfirm(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {showLogin && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLogin(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Connexion</h2>
            <input placeholder="Email/Tel" value={loginForm.identifiant} onChange={e => setLoginForm({ ...loginForm, identifiant: e.target.value })} style={{ marginBottom: 12 }} />
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input type={showPwdLogin ? "text" : "password"} placeholder="MDP" value={loginForm.motDePasse} onChange={e => setLoginForm({ ...loginForm, motDePasse: e.target.value })} style={{ width: "100%", padding: "12px 40px 12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10 }} />
              <button type="button" onClick={() => setShowPwdLogin(p => !p)} style={pwdButtonStyle}>{showPwdLogin ? "🙈" : "👁️"}</button>
            </div>
            {authError && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 12 }}>{authError}</div>}
            <button className="btn-primary" onClick={connecter} style={{ marginBottom: 12 }}>Connexion</button>
            <div style={{ textAlign: "center", fontSize: 12 }}>
              <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => { setShowLogin(false); setShowInscription(true); }}>Pas de compte? Inscris-toi</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSCRIPTION */}
      {showInscription && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowInscription(false)}>
          <div className="modal">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>S'inscrire</h2>
            <input placeholder="Prénom" value={inscForm.prenom} onChange={e => setInscForm({ ...inscForm, prenom: e.target.value })} style={{ marginBottom: 10 }} />
            <input placeholder="Nom" value={inscForm.nom} onChange={e => setInscForm({ ...inscForm, nom: e.target.value })} style={{ marginBottom: 10 }} />
            <input placeholder="Email" value={inscForm.email} onChange={e => setInscForm({ ...inscForm, email: e.target.value })} style={{ marginBottom: 10 }} />
            <input placeholder="Téléphone" value={inscForm.telephone} onChange={e => setInscForm({ ...inscForm, telephone: e.target.value })} style={{ marginBottom: 10 }} />
            <input placeholder="JJ/MM/AAAA" value={inscForm.date_naissance} onChange={e => { let v = e.target.value.replace(/\D/g, ""); if (v.length >= 3 && v.length <= 4) v = v.slice(0, 2) + "/" + v.slice(2); else if (v.length >= 5) v = v.slice(0, 2) + "/" + v.slice(2, 4) + "/" + v.slice(4, 8); setInscForm({ ...inscForm, date_naissance: v }); }} style={{ marginBottom: 10 }} maxLength={10} />
            <div style={{ position: "relative", marginBottom: 10 }}>
              <input type={showPwdInsc ? "text" : "password"} placeholder="MDP (8 char)" value={inscForm.mot_de_passe} onChange={e => setInscForm({ ...inscForm, mot_de_passe: e.target.value })} style={{ width: "100%", padding: "12px 40px 12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10 }} />
              <button type="button" onClick={() => setShowPwdInsc(p => !p)} style={pwdButtonStyle}>{showPwdInsc ? "🙈" : "👁️"}</button>
            </div>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <input type={showPwdInsc ? "text" : "password"} placeholder="Confirmer" value={inscForm.confirmer} onChange={e => setInscForm({ ...inscForm, confirmer: e.target.value })} style={{ width: "100%", padding: "12px 40px 12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10 }} />
              <button type="button" onClick={() => setShowPwdInsc(p => !p)} style={pwdButtonStyle}>{showPwdInsc ? "🙈" : "👁️"}</button>
            </div>
            {authError && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 12 }}>{authError}</div>}
            <button className="btn-primary" onClick={inscrire}>Créer</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", display: "flex", justifyContent: "space-around", alignItems: "center", height: 70, borderTop: "1px solid #e5e7eb", zIndex: 100 }}>
        <div onClick={() => setPage("accueil")} style={{ textAlign: "center", cursor: "pointer", padding: "8px 0", flex: 1, color: page === "accueil" ? "#2563eb" : "#9ca3af", fontSize: "1.4rem" }}>🏠</div>
        <div onClick={() => setPage("produits")} style={{ textAlign: "center", cursor: "pointer", padding: "8px 0", flex: 1, color: page === "produits" ? "#2563eb" : "#9ca3af", fontSize: "1.4rem" }}>🔍</div>
        <div style={{ textAlign: "center", padding: "8px 0", flex: 1, color: "#9ca3af", fontSize: "1.4rem" }}>⭐</div>
        <div onClick={() => setShowPanier(true)} style={{ textAlign: "center", cursor: "pointer", padding: "8px 0", flex: 1, color: "#9ca3af", fontSize: "1.4rem", position: "relative" }}>
          🛒
          {panier.reduce((s, i) => s + i.qty, 0) > 0 && <span style={{ position: "absolute", top: 0, right: 8, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{panier.reduce((s, i) => s + i.qty, 0)}</span>}
        </div>
        <div onClick={() => client ? setPage("compte") : setShowLogin(true)} style={{ textAlign: "center", cursor: "pointer", padding: "8px 0", flex: 1, color: page === "compte" ? "#2563eb" : "#9ca3af", fontSize: "1.4rem" }}>👤</div>
      </div>
    </div>
  );
}