"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const CATEGORIES = ["Tous", "Vêtements", "Chaussures", "Parfums", "Téléphones", "Sacs", "Bijoux", "Ordinateurs", "Accessoires"];
const ADMIN_PWD = "N-beat3140";
const MOMO = "+2290157577895";
const ADMIN_EMAIL = "gbadamassinahofal@gmail.com";
const ADMIN_WHATSAPP = "+33775958442";

const FRAIS_LIVRAISON = {
  "porto-novo": 500,
  "cotonou": 1000,
  "calavi": 1500
};

const getFraisLivraison = (ville) => {
  if (!ville) return 2000;
  const villeNorm = ville.toLowerCase().trim();
  return FRAIS_LIVRAISON[villeNorm] || 2000;
};

const parseVariantes = (variantes) => {
  if (!variantes) return [];
  if (typeof variantes === 'string') return JSON.parse(variantes);
  return Array.isArray(variantes) ? variantes : [];
};

const parseImages = (images) => {
  if (!images) return [];
  if (typeof images === 'string') return JSON.parse(images);
  return Array.isArray(images) ? images : [];
};

const globalStyles = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',sans-serif;background:#f8f9fa;color:#1a1a2e}input,select,textarea{width:100%;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;background:#fff;outline:none}input:focus,select:focus,textarea:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,0.1)}.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(4px);overflow-y:auto}.modal{background:#fff;border-radius:20px;padding:2rem;width:100%;max-width:600px;max-height:90vh;overflow-y:auto}.btn-primary{background:#2563eb;color:#fff;border:none;border-radius:10px;padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer;width:100%}.btn-primary:hover{background:#1d4ed8}`;

const envoyerEmailAdmin = async (subject, html) => {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, html })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("❌ Erreur email:", data);
      return false;
    }
    console.log("✅ Email envoyé:", data);
    return true;
  } catch (e) {
    console.error("❌ Exception email:", e);
    return false;
  }
};

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
  const [showPassword, setShowPassword] = useState({});
  const [allCommandes, setAllCommandes] = useState([]);
  const [filterCommande, setFilterCommande] = useState("");
  const [tabAdmin, setTabAdmin] = useState("commandes");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotForm, setForgotForm] = useState({ prenom: "", nom: "", date_naissance: "", newPassword: "", confirmPassword: "" });
  const [showAuthModal, setShowAuthModal] = useState("inscription");

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
    chargerCommandes();
    if (typeof window !== "undefined" && window.location.search.includes("page=admin")) {
      setPage("admin");
      setShowGenreModal(false);
    }
  }, []);

  useEffect(() => { localStorage.setItem("fastbuy_panier", JSON.stringify(panier)); }, [panier]);

  const chargerProduits = async () => { 
    try {
      const { data } = await supabase.from("produits").select("*").order("created_at", { ascending: false }); 
      if (data) setProduits(data);
    } catch (e) {
      console.error("Erreur chargerProduits:", e);
    }
  };
  
  const chargerCommandes = async () => { 
    try {
      const { data } = await supabase.from("commandes").select("*").order("created_at", { ascending: false }); 
      if (data) {
        setCommandes(data);
        setAllCommandes(data);
      }
    } catch (e) {
      console.error("Erreur chargerCommandes:", e);
    }
  };
  
  const chargerClients = async () => { 
    try {
      const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false }); 
      if (data) setClients(data);
      await chargerCommandes();
    } catch (e) {
      console.error("Erreur chargerClients:", e);
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
    const matchGenre = !genreChoisi || genreChoisi === "Tous" || p.genre === genreChoisi;
    return matchCat && matchSearch && matchGenre;
  });

  const totalPanier = panier.reduce((s, i) => s + i.price * i.qty, 0);
  
  const calculerTotalFinal = (ville, codePromo) => {
    let total = totalPanier;
    let reduction = 0;
    const isFirstOrder = client?.premiereCommande === true;
    
    if (codePromo && client?.prenom && isFirstOrder) {
      if (codePromo.toLowerCase() === (client.prenom + "10").toLowerCase()) {
        reduction = total * 0.1;
        total = total * 0.9;
      }
    }
    
    let fraisLivraison = 0;
    if (total < 20000 && ville) {
      fraisLivraison = getFraisLivraison(ville);
      total += fraisLivraison;
    }
    
    return { total: Math.round(total), reduction: Math.round(reduction), fraisLivraison };
  };
  
  const totalDetails = calculerTotalFinal(formCmd.ville, formCmd.codePromo);
  const totalFinal = totalDetails.total;

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

  const formatDateInput = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }
    setInscForm({ ...inscForm, date_naissance: value.slice(0, 10) });
  };

  const formatDateInputForgot = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }
    setForgotForm({ ...forgotForm, date_naissance: value.slice(0, 10) });
  };

  const inscrire = async () => {
    setAuthError("");
    if (!inscForm.prenom) { setAuthError("❌ Prénom requis"); return; }
    if (!inscForm.nom) { setAuthError("❌ Nom requis"); return; }
    if (!inscForm.email) { setAuthError("❌ Email requis"); return; }
    if (!inscForm.telephone) { setAuthError("❌ Téléphone requis"); return; }
    if (!inscForm.date_naissance) { setAuthError("❌ Date de naissance requise (JJ/MM/AAAA)"); return; }
    if (!inscForm.mot_de_passe) { setAuthError("❌ Mot de passe requis (min 8 caractères)"); return; }
    if (inscForm.mot_de_passe.length < 8) { setAuthError("❌ Mot de passe trop court (min 8 caractères)"); return; }
    if (inscForm.mot_de_passe !== inscForm.confirmer) { setAuthError("❌ Les mots de passe ne correspondent pas"); return; }
    
    let { data: emailExist } = await supabase.from("users").select("id").eq("email", inscForm.email).maybeSingle();
    if (emailExist) { setAuthError("📧 Cet email est déjà utilisé"); return; }
    
    let { data: telExist } = await supabase.from("users").select("id").eq("telephone", inscForm.telephone).maybeSingle();
    if (telExist) { setAuthError("📱 Ce numéro est déjà utilisé"); return; }
    
    // ✅ NE PAS envoyer premiereCommande - Supabase gère la valeur par défaut
    const { data, error } = await supabase.from("users").insert([{ 
      prenom: inscForm.prenom, 
      nom: `${inscForm.prenom} ${inscForm.nom}`, 
      email: inscForm.email, 
      telephone: inscForm.telephone, 
      date_naissance: inscForm.date_naissance, 
      mot_de_passe: inscForm.mot_de_passe
    }]).select().single();
    
    if (error) { setAuthError("❌ Erreur lors de l'inscription: " + (error.message || "Essayez plus tard")); return; }
    
    const user = { 
      id: data.id, 
      prenom: inscForm.prenom, 
      nom: data.nom, 
      email: data.email, 
      telephone: data.telephone, 
      premiereCommande: data.premiereCommande // ✅ Récupère la vraie valeur de Supabase
    };
    
    setClient(user);
    localStorage.setItem("fastbuy_client", JSON.stringify(user));
    
    // ✅ Affiche la promo SEULEMENT si c'est vraiment la première commande
    if (data.premiereCommande) {
      alert(`🎉 Bienvenue ${inscForm.prenom}!\n\n🎁 Code promo 1ère commande:\n${inscForm.prenom}10\n(-10% sur votre commande)`);
    } else {
      alert(`🎉 Bienvenue ${inscForm.prenom}!`);
    }
    
    setShowAuthModal("accueil");
    setInscForm({ prenom: "", nom: "", email: "", telephone: "", date_naissance: "", mot_de_passe: "", confirmer: "" });
  };

  const connecter = async () => {
    setAuthError("");
    if (!loginForm.identifiant) { setAuthError("❌ Email ou téléphone requis"); return; }
    if (!loginForm.motDePasse) { setAuthError("❌ Mot de passe requis"); return; }
    
    let { data } = await supabase.from("users").select("*").eq("email", loginForm.identifiant).maybeSingle();
    if (!data) ({ data } = await supabase.from("users").select("*").eq("telephone", loginForm.identifiant).maybeSingle());
    if (!data) { setAuthError("❌ Aucun compte trouvé avec cet email/téléphone"); return; }
    if (data.mot_de_passe !== loginForm.motDePasse) { setAuthError("❌ Mot de passe incorrect"); return; }
    const prenom = data.nom.split(" ")[0];
    const user = { id: data.id, prenom, nom: data.nom, email: data.email, telephone: data.telephone, premiereCommande: data.premiereCommande };
    setClient(user);
    localStorage.setItem("fastbuy_client", JSON.stringify(user));
    setShowAuthModal("accueil");
    setLoginForm({ identifiant: "", motDePasse: "" });
  };

  const recupererMotDePasse = async () => {
    setAuthError("");
    if (!forgotForm.prenom) { setAuthError("❌ Prénom requis"); return; }
    if (!forgotForm.nom) { setAuthError("❌ Nom requis"); return; }
    if (!forgotForm.date_naissance) { setAuthError("❌ Date de naissance requise"); return; }
    if (!forgotForm.newPassword) { setAuthError("❌ Nouveau mot de passe requis"); return; }
    if (forgotForm.newPassword.length < 8) { setAuthError("❌ Mot de passe trop court (min 8 caractères)"); return; }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) { setAuthError("❌ Les mots de passe ne correspondent pas"); return; }
    
    let { data } = await supabase
      .from("users")
      .select("*")
      .eq("nom", `${forgotForm.prenom} ${forgotForm.nom}`)
      .eq("date_naissance", forgotForm.date_naissance)
      .maybeSingle();
    
    if (!data) { setAuthError("❌ Aucun compte trouvé avec ces informations"); return; }
    
    const { error } = await supabase
      .from("users")
      .update({ mot_de_passe: forgotForm.newPassword })
      .eq("id", data.id);
    
    if (error) { setAuthError("❌ Erreur lors de la réinitialisation: " + error.message); return; }
    
    alert("✅ Mot de passe changé avec succès!\nVous pouvez maintenant vous connecter.");
    setShowAuthModal("connexion");
    setForgotForm({ prenom: "", nom: "", date_naissance: "", newPassword: "", confirmPassword: "" });
  };

  const envoyerCommande = async () => {
    if (!client?.id) {
      alert("❌ Erreur: Pas de client connecté!");
      return;
    }
    
    if (!formCmd.nom || !formCmd.email || !formCmd.telephone || !formCmd.numeroAppel || !formCmd.ville || !formCmd.quartier) { alert("Remplis tous!"); return; }
    if (panier.length === 0) { alert("Panier vide!"); return; }
    if (!captureFile) { alert("❌ Capture requise!"); return; }
    
    setLoading(true);
    
    try {
      let capturePath = null;
      if (captureFile) {
        const fileName = `cap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { data, error: uploadError } = await supabase.storage.from("produits").upload(fileName, captureFile, { upsert: true });
        if (uploadError) {
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

      const articlesHtml = panier.map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.title}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">x${item.qty}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(item.price * item.qty).toLocaleString()} FCFA</td>
        </tr>
      `).join("");

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #1a1a2e; max-width: 600px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">🎉 NOUVELLE COMMANDE!</h2>
          <div style="background: #eff6ff; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <p style="margin: 0;"><strong>Numéro:</strong> #${num}</p>
            <p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <h3 style="margin-bottom: 10px;">👤 Infos Client</h3>
          <div style="background: #f9fafb; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0;"><strong>Nom:</strong> ${formCmd.nom}</p>
            <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${formCmd.email}</p>
            <p style="margin: 0 0 8px 0;"><strong>Téléphone:</strong> ${formCmd.telephone}</p>
            <p style="margin: 0 0 8px 0;"><strong>Livraison:</strong> ${formCmd.numeroAppel}</p>
            <p style="margin: 0;"><strong>Lieu:</strong> ${formCmd.quartier}, ${formCmd.ville}</p>
          </div>
          <h3 style="margin-bottom: 10px;">📦 Articles</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left;">Produit</th>
                <th style="padding: 10px; text-align: center;">Qté</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${articlesHtml}
            </tbody>
          </table>
          <div style="background: #fff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Sous-total:</span>
              <strong>${totalPanier.toLocaleString()} FCFA</strong>
            </div>
            ${totalDetails.reduction > 0 ? `<div style="display: flex; justify-content: space-between; color: #16a34a;"><span>Réduction (-10%):</span><strong>-${totalDetails.reduction.toLocaleString()} FCFA</strong></div>` : ''}
            ${totalDetails.fraisLivraison > 0 ? `<div style="display: flex; justify-content: space-between; color: #f59e0b;"><span>Frais livraison:</span><strong>+${totalDetails.fraisLivraison.toLocaleString()} FCFA</strong></div>` : ''}
            <div style="display: flex; justify-content: space-between; border-top: 2px solid #2563eb; padding-top: 10px; font-weight: 700; color: #2563eb;">
              <span>TOTAL:</span>
              <span>${totalFinal.toLocaleString()} FCFA</span>
            </div>
          </div>
          <div style="background: #fffbeb; border: 2px solid #fde68a; padding: 15px; border-radius: 10px;">
            <p style="margin: 0 0 10px 0; font-weight: 600;">📱 Paiement:</p>
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #f59e0b;">${MOMO}</p>
          </div>
        </div>
      `;

      await envoyerEmailAdmin(`🎉 NOUVELLE COMMANDE #${num} - ${formCmd.nom}`, emailHtml);
      
      if (client?.premiereCommande) {
        await supabase.from("users").update({ premiereCommande: false }).eq("id", client.id);
        const updatedClient = { ...client, premiereCommande: false };
        setClient(updatedClient);
        localStorage.setItem("fastbuy_client", JSON.stringify(updatedClient));
      }
      
      setShowConfirm({ numero: num, totalFinal, ville: formCmd.ville });
      setPanier([]);
      setShowCommande(false);
      setFormCmd({ nom: "", email: "", telephone: "", numeroAppel: "", ville: "", quartier: "", codePromo: "" });
      setCaptureFile(null);
      setLoading(false);
      
      await chargerCommandes();
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
      
      for (const file of imageFiles) {
        const fileName = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { data, error: uploadError } = await supabase.storage.from("produits").upload(fileName, file, { upsert: true });
        if (uploadError) {
          alert("Erreur upload: " + uploadError.message);
          setLoading(false);
          return;
        }
        imagePaths.push(fileName);
      }
      
      const prodData = { 
        title: newProduct.title,
        description: newProduct.description,
        category: newProduct.category,
        genre: newProduct.genre,
        etat: newProduct.etat || "Neuf",
        price: parseInt(variantes[0].prix),
        image: imagePaths[0],
        images: imagePaths,
        variantes: variantes
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
      setImageFiles([]);
      setImagePreviews([]);
      setVariantes([]);
      setLoading(false);
    } catch (e) {
      alert("Erreur: " + e.message);
      setLoading(false);
    }
  };

  const supprimerProduit = async (produitId) => {
    if (!confirm("Confirmer?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("produits").delete().eq("id", produitId);
      if (error) {
        alert("❌ Erreur: " + error.message);
        setLoading(false);
        return;
      }
      alert("✅ Produit supprimé!");
      await chargerProduits();
      setProduitEdit(null);
      setLoading(false);
    } catch (e) {
      alert("❌ Erreur: " + e.message);
      setLoading(false);
    }
  };

  const modifierProduit = async (produitId) => {
    if (!editForm.price || !editForm.etat) { alert("Remplis tous!"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("produits").update({ price: parseInt(editForm.price), etat: editForm.etat }).eq("id", produitId);
      if (error) {
        alert("❌ Erreur: " + error.message);
        setLoading(false);
        return;
      }
      alert("✅ Produit modifié!");
      await chargerProduits();
      setProduitEdit(null);
      setEditForm({ price: "", etat: "" });
      setLoading(false);
    } catch (e) {
      alert("❌ Erreur: " + e.message);
      setLoading(false);
    }
  };

  const chargerCommandesClient = async (clientId) => {
    try {
      const { data, error } = await supabase.from("commandes").select("*").eq("user_id", clientId).order("created_at", { ascending: false });
      if (error) {
        console.error("Erreur charger commandes client:", error);
        setCommandesClient([]);
        return;
      }
      setCommandesClient(data || []);
    } catch (e) {
      console.error("Exception:", e);
      setCommandesClient([]);
    }
  };

  // ✅ FONCTION CORRIGÉE POUR SUPPRIMER UN CLIENT
  const supprimerClient = async (clientId) => {
    if (!confirm("Confirmer? Ses messages, commandes et données seront aussi supprimés!")) return;
    setLoading(true);
    
    try {
      // 1️⃣ D'abord supprimer les messages du client
      const { error: errMsg } = await supabase
        .from("messages")
        .delete()
        .eq("user_id", clientId);
      
      if (errMsg) {
        console.error("❌ Erreur suppression messages:", errMsg);
        alert("❌ Erreur suppression messages: " + errMsg.message);
        setLoading(false);
        return;
      }
      
      console.log("✅ Messages supprimés");

      // 2️⃣ Ensuite supprimer les commandes du client
      const { error: errCmd } = await supabase
        .from("commandes")
        .delete()
        .eq("user_id", clientId);
      
      if (errCmd) {
        console.error("❌ Erreur suppression commandes:", errCmd);
        alert("❌ Erreur suppression commandes: " + errCmd.message);
        setLoading(false);
        return;
      }
      
      console.log("✅ Commandes supprimées");

      // 3️⃣ Finalement supprimer le client
      const { error: errUser } = await supabase
        .from("users")
        .delete()
        .eq("id", clientId);
      
      if (errUser) {
        console.error("❌ Erreur suppression client:", errUser);
        alert("❌ Erreur suppression client: " + errUser.message);
        setLoading(false);
        return;
      }

      console.log("✅ Client supprimé");
      alert("✅ Client, messages et commandes supprimés!");
      
      // 4️⃣ Recharger la liste des clients
      await chargerClients();
      setClientTrouve(null);
      setLoading(false);
      
    } catch (e) {
      console.error("❌ Exception:", e);
      alert("❌ Erreur: " + (e.message || "Erreur inconnue"));
      setLoading(false);
    }
  };

  // ✅ FONCTION CORRIGÉE POUR SUPPRIMER UNE COMMANDE
  const supprimerCommande = async (commandeId) => {
    if (!confirm("Supprimer cette commande?")) return;
    
    try {
      const { error } = await supabase
        .from("commandes")
        .delete()
        .eq("id", commandeId);
      
      if (error) {
        console.error("❌ Erreur suppression commande:", error);
        alert("❌ Erreur: " + error.message);
        return;
      }
      
      console.log("✅ Commande supprimée");
      alert("✅ Commande supprimée!");
      await chargerCommandes();
      
    } catch (e) {
      console.error("❌ Exception:", e);
      alert("❌ Erreur: " + (e.message || "Erreur inconnue"));
    }
  };

  const changerStatutCommande = async (commandeId, nouveauStatut) => {
    try {
      const { error } = await supabase
        .from("commandes")
        .update({ statut: nouveauStatut })
        .eq("id", commandeId);
      
      if (error) {
        console.error("❌ Erreur changement statut:", error);
        alert("❌ Erreur: " + error.message);
        return;
      }
      
      await chargerCommandes();
    } catch (e) {
      console.error("❌ Exception:", e);
      alert("❌ Erreur: " + e.message);
    }
  };

  const changerMdpClient = async (clientId) => {
    if (!newMdpClient || newMdpClient.length < 8) { alert("Min 8 chars!"); return; }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ mot_de_passe: newMdpClient })
        .eq("id", clientId);
      
      if (error) {
        alert("❌ Erreur: " + error.message);
        setLoading(false);
        return;
      }
      
      alert("✅ Mot de passe changé!");
      setNewMdpClient("");
      setLoading(false);
    } catch (e) {
      alert("❌ Erreur: " + e.message);
      setLoading(false);
    }
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
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Admin Dashboard</h1>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn-primary" style={{ width: "auto", padding: "10px 20px" }} onClick={() => { setShowAddProduct(true); setVariantes([]); }}>Ajouter Produit</button>
                <button className="btn-primary" style={{ width: "auto", padding: "10px 20px", background: "#f59e0b" }} onClick={() => setShowGererProduits(true)}>Gérer Produits</button>
                <button className="btn-primary" style={{ width: "auto", padding: "10px 20px", background: "#10b981" }} onClick={() => { setShowGererClients(true); setTabAdmin("commandes"); chargerClients(); }}>Gérer Commandes</button>
                <button onClick={() => { setAdminOk(false); setAdminPwd(""); }} style={{ padding: "10px 18px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>Déco</button>
              </div>
            </div>
          </div>
        )}

        {showAddProduct && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddProduct(false); }}>
            <div className="modal">
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>Ajouter Produit</h2>
              <input value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} placeholder="Titre" style={{ marginBottom: 12 }} />
              <textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Description" style={{ marginBottom: 12 }} rows={3} />
              <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={{ marginBottom: 12 }}>
                {CATEGORIES.filter(c => c !== "Tous").map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={newProduct.genre} onChange={e => setNewProduct({ ...newProduct, genre: e.target.value })} style={{ marginBottom: 12 }}>
                <option>Homme</option>
                <option>Femme</option>
                <option>Unisexe</option>
              </select>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Photos</label>
                <div onClick={() => document.getElementById("photo-input").click()} style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "1rem", textAlign: "center", cursor: "pointer", marginTop: 6 }}>
                  {imagePreviews.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                      {imagePreviews.map((p, i) => (
                        <div key={i} style={{ position: "relative", paddingBottom: "100%", background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
                          <img src={p} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                          <button onClick={e => { e.stopPropagation(); setImageFiles(imageFiles.filter((_, idx) => idx !== i)); setImagePreviews(imagePreviews.filter((_, idx) => idx !== i)); }} style={{ position: "absolute", top: 2, right: 2, background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>Cliquez pour ajouter</div>
                  )}
                  <input id="photo-input" type="file" accept="image/*" multiple onChange={e => { const files = Array.from(e.target.files).slice(0, 5); setImageFiles(files); setImagePreviews(files.map(f => URL.createObjectURL(f))); }} style={{ display: "none" }} />
                </div>
              </div>

              <div style={{ marginBottom: 12, background: "#f9fafb", borderRadius: 10, padding: "1rem" }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Variantes</label>
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
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowGererProduits(false); }}>
            <div className="modal" style={{ maxWidth: "900px", display: "flex", flexDirection: "column", padding: 0 }}>
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
                  <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>{produitEdit.title}</h2>
                    <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} placeholder="Prix" style={{ marginBottom: 12 }} />
                    <select value={editForm.etat} onChange={e => setEditForm({ ...editForm, etat: e.target.value })} style={{ marginBottom: 12 }}>
                      <option>Neuf</option>
                      <option>Bon état</option>
                      <option>Occasion</option>
                    </select>
                    <button className="btn-primary" style={{ background: "#10b981", marginBottom: 8 }} onClick={() => modifierProduit(produitEdit.id)}>✏️ Modifier</button>
                    <button className="btn-primary" style={{ background: "#ef4444" }} onClick={() => supprimerProduit(produitEdit.id)}>🗑️ Supprimer</button>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>Sélectionne un produit</div>
                )}
              </div>
            </div>
          </div>
        )}

        {showGererClients && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowGererClients(false); }}>
            <div className="modal" style={{ maxWidth: "1200px", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0 }}>
              <div style={{ display: "flex", background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                <button 
                  onClick={() => setTabAdmin("commandes")}
                  style={{
                    flex: 1,
                    padding: "1rem",
                    border: "none",
                    background: tabAdmin === "commandes" ? "#10b981" : "transparent",
                    color: tabAdmin === "commandes" ? "#fff" : "#6b7280",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  📦 TOUTES LES COMMANDES ({allCommandes.length})
                </button>
                <button 
                  onClick={() => setTabAdmin("clients")}
                  style={{
                    flex: 1,
                    padding: "1rem",
                    border: "none",
                    background: tabAdmin === "clients" ? "#2563eb" : "transparent",
                    color: tabAdmin === "clients" ? "#fff" : "#6b7280",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  👥 PAR CLIENT
                </button>
              </div>

              {tabAdmin === "commandes" ? (
                <div style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
                  <input 
                    type="text"
                    placeholder="Rechercher..."
                    value={filterCommande}
                    onChange={e => setFilterCommande(e.target.value)}
                    style={{ marginBottom: "1.5rem", maxWidth: "400px" }}
                  />
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
                    {allCommandes.filter(cmd => 
                      cmd.numero.includes(filterCommande.toUpperCase()) || 
                      cmd.nom.toLowerCase().includes(filterCommande.toLowerCase())
                    ).map(cmd => (
                      <div key={cmd.id} style={{
                        border: "2px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "1.5rem",
                        background: "#fff"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "2px solid #e5e7eb" }}>
                          <div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2563eb" }}>{cmd.numero}</div>
                            <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "4px" }}>
                              {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <select 
                            value={cmd.statut}
                            onChange={(e) => changerStatutCommande(cmd.id, e.target.value)}
                            style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "0.85rem" }}
                          >
                            <option>En attente</option>
                            <option>En cours</option>
                            <option>Livré</option>
                            <option>Annulée</option>
                          </select>
                        </div>

                        <div style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
                          <div style={{ fontWeight: 600, color: "#1a1a2e", marginBottom: "0.5rem" }}>👤 {cmd.nom}</div>
                          <div style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "0.25rem" }}>📧 {cmd.email}</div>
                          <div style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "0.25rem" }}>📱 {cmd.telephone}</div>
                          <div style={{ color: "#f59e0b", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>📞 {cmd.numeroAppel}</div>
                          <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>🏠 {cmd.quartier}, {cmd.ville}</div>
                        </div>

                        <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #e5e7eb", maxHeight: "120px", overflowY: "auto" }}>
                          <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>📦 Articles:</div>
                          {cmd.articles && JSON.parse(cmd.articles).map((art, i) => (
                            <div key={i} style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                              • {art.title} x{art.qty} = {(art.price * art.qty).toLocaleString()} FCFA
                            </div>
                          ))}
                        </div>

                        <div style={{ background: "#eff6ff", padding: "0.75rem", borderRadius: "6px", marginBottom: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 600 }}>💰 Total:</span>
                          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#2563eb" }}>{cmd.totalFinal?.toLocaleString()} FCFA</span>
                        </div>

                        <div style={{ background: cmd.paiement === "Confirmé" ? "#d1fae5" : "#fef3c7", padding: "0.75rem", borderRadius: "6px", marginBottom: "0.75rem", fontSize: "0.85rem", fontWeight: 600, color: cmd.paiement === "Confirmé" ? "#065f46" : "#92400e" }}>
                          💳 Paiement: {cmd.paiement}
                        </div>

                        {cmd.capture && (
                          <button 
                            onClick={() => window.open(`https://nuhpdqioggxznceqvpvx.supabase.co/storage/v1/object/public/produits/${cmd.capture}`, '_blank')}
                            style={{
                              width: "100%",
                              padding: "0.75rem",
                              background: "#d1fae5",
                              color: "#065f46",
                              border: "1px solid #6ee7b7",
                              borderRadius: "6px",
                              marginBottom: "0.75rem",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            👁️ Voir la capture
                          </button>
                        )}

                        <button 
                          onClick={() => supprimerCommande(cmd.id)}
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            background: "#fef2f2",
                            color: "#ef4444",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.9rem"
                          }}
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                  <div style={{ width: "220px", borderRight: "1px solid #e5e7eb", overflowY: "auto", background: "#f9fafb", padding: "1rem" }}>
                    {clients.map(c => (
                      <div key={c.id} onClick={() => { setClientTrouve(c); chargerCommandesClient(c.id); }} style={{ padding: "10px", borderRadius: 8, marginBottom: 8, fontSize: 11, cursor: "pointer", background: clientTrouve?.id === c.id ? "#2563eb" : "#fff", color: clientTrouve?.id === c.id ? "#fff" : "#1a1a2e", border: "1px solid #e5e7eb", fontWeight: 600 }}>
                        <div>{c.nom}</div>
                        <div style={{ fontSize: 9, opacity: 0.7, marginTop: 3 }}>{c.telephone}</div>
                      </div>
                    ))}
                  </div>

                  {clientTrouve ? (
                    <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>{clientTrouve.nom}</h3>
                      <div style={{ background: "#f9fafb", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem" }}>
                        <div style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>📧 {clientTrouve.email}</div>
                        <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>📱 {clientTrouve.telephone}</div>
                      </div>

                      <h4 style={{ fontWeight: 600, marginBottom: "1rem" }}>Commandes ({commandesClient.length})</h4>
                      {commandesClient.map(cmd => (
                        <div key={cmd.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", marginBottom: "1rem" }}>
                          <div style={{ fontWeight: 600, color: "#2563eb", marginBottom: "0.5rem" }}>{cmd.numero}</div>
                          <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>💰 {cmd.totalFinal?.toLocaleString()} FCFA</div>
                          <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>📊 {cmd.statut}</div>
                          <button onClick={() => supprimerCommande(cmd.id)} style={{ width: "100%", padding: "6px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🗑️ Supprimer</button>
                        </div>
                      ))}

                      <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "1rem", marginTop: "1rem" }}>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>⚙️ Actions</h3>
                        <div style={{ position: "relative", marginBottom: 8 }}>
                          <input type={showPassword.gererClientMdp ? "text" : "password"} value={newMdpClient} onChange={e => setNewMdpClient(e.target.value)} placeholder="Nouveau MDP" style={{ fontSize: 12, paddingRight: 40 }} />
                          <button onClick={() => togglePassword("gererClientMdp")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>
                            {showPassword.gererClientMdp ? "👁️" : "👁️‍🗨️"}
                          </button>
                        </div>
                        <button className="btn-primary" style={{ background: "#10b981", marginBottom: 8, fontSize: 12, padding: "10px" }} onClick={() => changerMdpClient(clientTrouve.id)}>🔐 Changer MDP</button>
                        <button className="btn-primary" style={{ background: "#ef4444", fontSize: 12, padding: "10px" }} onClick={() => supprimerClient(clientTrouve.id)} disabled={loading}>{loading ? "Suppression..." : "🗑️ Supprimer"}</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                      👈 Sélectionne un client
                    </div>
                  )}
                </div>
              )}
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
          <span style={{ cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "#2563eb", textDecoration: "underline" }} onClick={() => setShowAuthModal("inscription")}>S'inscrire / Connexion</span>
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
                      {parseVariantes(item.variantes).length > 0 
                        ? parseVariantes(item.variantes)[0]?.prix?.toLocaleString() 
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
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowProduit(null); setSelectedVariante(null); } }}>
          <div className="modal">
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>{showProduit.title}</h2>
            <div style={{ height: 200, background: "#f3f4f6", borderRadius: 12, marginBottom: 12, display: "flex", alignItems: "center" }}>
              {showProduit.image ? <img src={getImageUrl(showProduit.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
            </div>
            {showProduit.description && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>{showProduit.description}</div>}
            {parseVariantes(showProduit.variantes).length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>🎯 Sélectionner une variante</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                  {parseVariantes(showProduit.variantes).map((v, i) => (
                    <button 
                      type="button"
                      key={i}
                      onClick={() => setSelectedVariante(i)}
                      style={{
                        padding: "12px",
                        borderRadius: 8,
                        border: selectedVariante === i ? "3px solid #2563eb" : "2px solid #d1d5db",
                        background: selectedVariante === i ? "#eff6ff" : "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1a1a2e",
                        textAlign: "left"
                      }}
                    >
                      {selectedVariante === i && "✅ "}
                      {v.couleur} • {v.taille} • {v.nbrPieces} pcs - {v.prix.toLocaleString()} FCFA
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button type="button" onClick={() => { if (selectedVariante === null && parseVariantes(showProduit.variantes).length > 0) { alert("Sélectionne une variante!"); return; } const variante = selectedVariante !== null && parseVariantes(showProduit.variantes).length > 0 ? parseVariantes(showProduit.variantes)[selectedVariante] : null; ajouterAuPanier({...showProduit, price: variante ? variante.prix : showProduit.price}, variante); }} className="btn-primary">{!client ? "Connexion" : "Ajouter au panier"}</button>
          </div>
        </div>
      )}

      {showContactAdmin && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowContactAdmin(false); }}>
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
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowPanier(false); }}>
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
                      {item.variante && <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>🎨 {item.variante.couleur} • {item.variante.taille}</div>}
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
                    <span style={{ color: "#2563eb" }}>{totalPanier.toLocaleString()} FCFA</span>
                  </div>
                  <button className="btn-primary" onClick={() => { setShowPanier(false); setShowCommande(true); }}>Procéder</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showCommande && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCommande(false); }}>
          <div className="modal">
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>📋 Commande</h2>
            
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem" }}>Vos infos</h3>
              <input placeholder="Nom complet" value={formCmd.nom} onChange={e => setFormCmd({ ...formCmd, nom: e.target.value })} style={{ marginBottom: 12 }} />
              <input placeholder="Email" value={formCmd.email} onChange={e => setFormCmd({ ...formCmd, email: e.target.value })} style={{ marginBottom: 12 }} />
              <input placeholder="Téléphone" value={formCmd.telephone} onChange={e => setFormCmd({ ...formCmd, telephone: e.target.value })} style={{ marginBottom: 12 }} />
              <input placeholder="Numéro appel" value={formCmd.numeroAppel} onChange={e => setFormCmd({ ...formCmd, numeroAppel: e.target.value })} style={{ marginBottom: 12 }} />
              <input placeholder="Ville" value={formCmd.ville} onChange={e => setFormCmd({ ...formCmd, ville: e.target.value })} style={{ marginBottom: 12 }} />
              <input placeholder="Quartier" value={formCmd.quartier} onChange={e => setFormCmd({ ...formCmd, quartier: e.target.value })} style={{ marginBottom: 12 }} />
              <input placeholder="Code promo" value={formCmd.codePromo} onChange={e => setFormCmd({ ...formCmd, codePromo: e.target.value })} style={{ marginBottom: 0 }} />
            </div>

            {client?.premiereCommande && client?.prenom && (
              <div style={{ background: "#eff6ff", border: "2px solid #bfdbfe", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem", fontSize: 12, fontWeight: 600 }}>
                🎁 Code: {client.prenom}10 (-10%)
              </div>
            )}

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem" }}>💰 Détails</h3>
              
              <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #e5e7eb" }}>
                {panier.map((item, i) => (
                  <div key={i} style={{ marginBottom: "0.5rem", fontSize: 12, display: "flex", justifyContent: "space-between" }}>
                    <span>{item.title} x{item.qty}</span>
                    <strong>{(item.price * item.qty).toLocaleString()} FCFA</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: "0.75rem", color: "#6b7280" }}>
                <span>Sous-total</span>
                <span>{totalPanier.toLocaleString()} FCFA</span>
              </div>

              {totalDetails.reduction > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: "0.75rem", color: "#16a34a", fontWeight: 600 }}>
                  <span>Réduction (-10%)</span>
                  <span>-{totalDetails.reduction.toLocaleString()} FCFA</span>
                </div>
              )}

              {formCmd.ville && totalDetails.fraisLivraison > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: "0.75rem", color: "#f59e0b" }}>
                  <span>Frais livraison</span>
                  <span>+{totalDetails.fraisLivraison.toLocaleString()} FCFA</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, paddingTop: "1rem", borderTop: "2px solid #2563eb", color: "#2563eb" }}>
                <span>Total</span>
                <span>{totalFinal.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div style={{ background: "#fffbeb", border: "2px solid #fde68a", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: "0.75rem" }}>📱 Envoyer à:</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f59e0b" }}>{MOMO}</div>
              <div style={{ fontSize: 12, color: "#b45309", fontWeight: 600, marginTop: "0.5rem" }}>Montant: {totalFinal.toLocaleString()} FCFA</div>
            </div>

            <div onClick={() => document.getElementById("capture-input").click()} style={{ border: "2px dashed #d1d5db", borderRadius: 12, padding: "2rem", textAlign: "center", cursor: "pointer", marginBottom: "1.5rem", background: "#fafafa", fontSize: 13 }}>
              {captureFile ? (
                <div style={{ color: "#16a34a", fontWeight: 600 }}>✅ Reçue</div>
              ) : (
                <div style={{ color: "#6b7280" }}>📸 Cliquez pour joindre capture</div>
              )}
              <input id="capture-input" type="file" accept="image/*" onChange={e => setCaptureFile(e.target.files[0])} style={{ display: "none" }} />
            </div>

            <button onClick={envoyerCommande} disabled={loading} className="btn-primary">{loading ? "Envoi..." : "✅ Confirmer"}</button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: "center", maxWidth: "500px" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 12, color: "#16a34a" }}>Confirmée!</h2>
            <div style={{ background: "#eff6ff", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: 700, color: "#2563eb", fontSize: "1.2rem", marginBottom: 4 }}>#{showConfirm.numero}</div>
            </div>
            
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "left", fontSize: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: "1rem" }}>📦 Résumé:</div>
              {panier.map((item, i) => (
                <div key={i} style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                  <span>{item.title} x{item.qty}</span>
                  <strong>{(item.price * item.qty).toLocaleString()} FCFA</strong>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", marginTop: "1rem", display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#2563eb" }}>
                <span>Total:</span>
                <span>{showConfirm.totalFinal?.toLocaleString()} FCFA</span>
              </div>
            </div>
            
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem", fontSize: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: "0.75rem" }}>📱 Paiement:</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f59e0b" }}>{MOMO}</div>
              <div style={{ color: "#b45309", fontWeight: 600, marginTop: "0.5rem" }}>Montant: {showConfirm.totalFinal?.toLocaleString()} FCFA</div>
            </div>
            
            <button className="btn-primary" onClick={() => { setShowConfirm(null); setFormCmd({ nom: "", email: "", telephone: "", numeroAppel: "", ville: "", quartier: "", codePromo: "" }); }}>Fermer</button>
          </div>
        </div>
      )}

      {showAuthModal !== "accueil" && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAuthModal("accueil"); }}>
          <div className="modal">
            {showAuthModal === "inscription" ? (
              <>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>✍️ S'inscrire</h2>
                <input placeholder="Prénom" value={inscForm.prenom} onChange={e => setInscForm({ ...inscForm, prenom: e.target.value })} style={{ marginBottom: 12 }} />
                <input placeholder="Nom" value={inscForm.nom} onChange={e => setInscForm({ ...inscForm, nom: e.target.value })} style={{ marginBottom: 12 }} />
                <input placeholder="Email" value={inscForm.email} onChange={e => setInscForm({ ...inscForm, email: e.target.value })} style={{ marginBottom: 12 }} />
                <input placeholder="Téléphone" value={inscForm.telephone} onChange={e => setInscForm({ ...inscForm, telephone: e.target.value })} style={{ marginBottom: 12 }} />
                <input 
                  placeholder="Date naissance (JJ/MM/AAAA)" 
                  value={inscForm.date_naissance} 
                  onChange={formatDateInput} 
                  style={{ marginBottom: 12 }} 
                  maxLength={10}
                  inputMode="numeric"
                />
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <input type={showPassword.inscMdp ? "text" : "password"} placeholder="Mot de passe (min 8 caractères)" value={inscForm.mot_de_passe} onChange={e => setInscForm({ ...inscForm, mot_de_passe: e.target.value })} style={{ paddingRight: 40 }} />
                  <button onClick={() => togglePassword("inscMdp")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
                    {showPassword.inscMdp ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <input type={showPassword.inscConf ? "text" : "password"} placeholder="Confirmer le mot de passe" value={inscForm.confirmer} onChange={e => setInscForm({ ...inscForm, confirmer: e.target.value })} style={{ paddingRight: 40 }} />
                  <button onClick={() => togglePassword("inscConf")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
                    {showPassword.inscConf ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {authError && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 12, fontWeight: 600 }}>{authError}</div>}
                <button className="btn-primary" onClick={inscrire} style={{ marginBottom: 12 }}>Créer un compte</button>
                <div style={{ textAlign: "center", fontSize: 12, color: "#6b7280" }}>
                  Déjà inscrit ? <span style={{ cursor: "pointer", color: "#2563eb", fontWeight: 600 }} onClick={() => { setShowAuthModal("connexion"); setAuthError(""); }}>Se connecter</span>
                </div>
                <div style={{ textAlign: "center", fontSize: 12, color: "#6b7280", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
                  Besoin d'aide ? <span style={{ cursor: "pointer", color: "#10b981", fontWeight: 600 }} onClick={() => setShowContactAdmin(true)}>Nous contacter</span>
                </div>
              </>
            ) : showAuthModal === "connexion" ? (
              <>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>🔐 Connexion</h2>
                <input placeholder="Email ou téléphone" value={loginForm.identifiant} onChange={e => setLoginForm({ ...loginForm, identifiant: e.target.value })} style={{ marginBottom: 12 }} />
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <input type={showPassword.login ? "text" : "password"} placeholder="Mot de passe" value={loginForm.motDePasse} onChange={e => setLoginForm({ ...loginForm, motDePasse: e.target.value })} style={{ paddingRight: 40 }} />
                  <button onClick={() => togglePassword("login")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
                    {showPassword.login ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {authError && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 12, fontWeight: 600 }}>{authError}</div>}
                <button className="btn-primary" onClick={connecter} style={{ marginBottom: 12 }}>Se connecter</button>
                <div style={{ textAlign: "center", fontSize: 12, color: "#6b7280" }}>
                  Pas de compte ? <span style={{ cursor: "pointer", color: "#2563eb", fontWeight: 600 }} onClick={() => { setShowAuthModal("inscription"); setAuthError(""); }}>S'inscrire</span>
                </div>
                <div style={{ textAlign: "center", fontSize: 12, color: "#6b7280", marginTop: "0.5rem" }}>
                  <span style={{ cursor: "pointer", color: "#f59e0b", fontWeight: 600 }} onClick={() => { setShowAuthModal("forgot"); setAuthError(""); }}>Mot de passe oublié ?</span>
                </div>
                <div style={{ textAlign: "center", fontSize: 12, color: "#6b7280", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
                  Besoin d'aide ? <span style={{ cursor: "pointer", color: "#10b981", fontWeight: 600 }} onClick={() => setShowContactAdmin(true)}>Nous contacter</span>
                </div>
              </>
            ) : showAuthModal === "forgot" ? (
              <>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>🔑 Réinitialiser le mot de passe</h2>
                <div style={{ background: "#eff6ff", borderRadius: 10, padding: "1rem", marginBottom: "1.5rem", fontSize: 12, color: "#1e40af" }}>
                  📋 Entrez vos informations d'inscription pour réinitialiser votre mot de passe
                </div>
                <input placeholder="Prénom" value={forgotForm.prenom} onChange={e => setForgotForm({ ...forgotForm, prenom: e.target.value })} style={{ marginBottom: 12 }} />
                <input placeholder="Nom" value={forgotForm.nom} onChange={e => setForgotForm({ ...forgotForm, nom: e.target.value })} style={{ marginBottom: 12 }} />
                <input 
                  placeholder="Date naissance (JJ/MM/AAAA)" 
                  value={forgotForm.date_naissance} 
                  onChange={formatDateInputForgot} 
                  style={{ marginBottom: 12 }} 
                  maxLength={10}
                  inputMode="numeric"
                />
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <input type={showPassword.forgotMdp ? "text" : "password"} placeholder="Nouveau mot de passe" value={forgotForm.newPassword} onChange={e => setForgotForm({ ...forgotForm, newPassword: e.target.value })} style={{ paddingRight: 40 }} />
                  <button onClick={() => togglePassword("forgotMdp")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
                    {showPassword.forgotMdp ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <input type={showPassword.forgotConf ? "text" : "password"} placeholder="Confirmer le mot de passe" value={forgotForm.confirmPassword} onChange={e => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })} style={{ paddingRight: 40 }} />
                  <button onClick={() => togglePassword("forgotConf")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
                    {showPassword.forgotConf ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {authError && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 12, fontWeight: 600 }}>{authError}</div>}
                <button className="btn-primary" onClick={recupererMotDePasse} style={{ marginBottom: 12, background: "#f59e0b" }}>Réinitialiser</button>
                <div style={{ textAlign: "center", fontSize: 12, color: "#6b7280" }}>
                  <span style={{ cursor: "pointer", color: "#2563eb", fontWeight: 600 }} onClick={() => { setShowAuthModal("connexion"); setAuthError(""); }}>Retour à la connexion</span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}