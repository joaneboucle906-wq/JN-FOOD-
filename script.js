/* =========================================================
   JN Food - script.js (quantités + contrôles serveur)
   ========================================================= */
/* ---------- RÉGLAGES ---------- */
var URL_SHEET = "https://script.google.com/macros/s/AKfycbyiwIBMtLVV5dz2B1wH9-iJJUHW6e2tLxSj89e6FYYi5IgO-Sf4M4BxTluXnXVhn1FsqQ/exec";
var WAVE_LIEN = "https://pay.wave.com/m/M_ci_JbW10MlZ1A4Y/c/ci/";
// true = commandes seulement de 17h00 à 05h00 / false = toujours ouvert (pour tester)
// (le même réglage existe aussi dans le script Google)
var VERIFIER_HORAIRES = false;
var QTE_MAX = 10;
var panier = {};               // id du plat -> quantité
var commandeEnregistree = null;
/* ---------- OUTILS ---------- */
function formaterPrix(n) {
  return n.toLocaleString("fr-FR") + " FCFA";
}
function trouverPlat(id) {
  return MENU.find(function (p) { return p.id === id; });
}
function echapper(texte) {
  var d = document.createElement("div");
  d.textContent = texte;
  return d.innerHTML;
}
function afficherMessage(zone, type, html) {
  var msg = document.getElementById(zone);
  msg.className = type;
  msg.innerHTML = html;
  msg.hidden = false;
}
function idsPanier() {
  return Object.keys(panier);
}
function calculerTotal() {
  var somme = 0;
  idsPanier().forEach(function (id) {
    somme += trouverPlat(id).prix * panier[id];
  });
  return somme;
}
function actualiser() {
  afficherMenu();
  afficherPanier();
}
/* ---------- MENU ---------- */
function afficherMenu() {
  var grille = document.getElementById("menu-grid");
  grille.innerHTML = "";
  MENU.forEach(function (plat) {
    var carte = document.createElement("div");
    carte.className = "dish" + (commandeEnregistree ? " locked" : "");
    carte.setAttribute("role", "button");
    carte.setAttribute("tabindex", "0");
    carte.setAttribute("aria-pressed", panier[plat.id] ? "true" : "false");
    carte.dataset.id = plat.id;
   var zoneImg = document.createElement("div");
    zoneImg.className = "dish-img";
    var img = document.createElement("img");
    img.src = plat.image;
    img.alt = plat.nom;
    img.loading = "lazy";
    img.onerror = function () { img.style.display = "none"; };
    zoneImg.appendChild(img);
    var texte = document.createElement("div");
    texte.className = "dish-text";
   var badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = plat.categorie;
    var titre = document.createElement("h3");
    titre.textContent = plat.nom;
   var desc = document.createElement("p");
    desc.textContent = plat.description;
    var prix = document.createElement("p");
    prix.className = "price";
    prix.textContent = formaterPrix(plat.prix);
    texte.appendChild(badge);
    texte.appendChild(titre);
    texte.appendChild(desc);
    texte.appendChild(prix);
    carte.appendChild(zoneImg);
    carte.appendChild(texte);
    carte.addEventListener("click", function () { basculerPlat(plat.id); });
    carte.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        basculerPlat(plat.id);
      }
    });
    grille.appendChild(carte);
  });
}
/* ---------- PANIER ---------- */
function basculerPlat(id) {
  if (commandeEnregistree) return; // sélection verrouillée après enregistrement
  if (panier[id]) {
    delete panier[id];
  } else {
    panier[id] = 1;
  }
  actualiser();
}
function changerQuantite(id, delta) {
  if (commandeEnregistree) return;
  var q = (panier[id] || 0) + delta;
  if (q <= 0) {
    delete panier[id];
  } else {
    panier[id] = Math.min(q, QTE_MAX);
  }
  actualiser();
}
function creerBouton(texte, etiquette, action, desactive) {
  var b = document.createElement("button");
  b.type = "button";
  b.className = "qty-btn";
  b.textContent = texte;
  b.setAttribute("aria-label", etiquette);
  b.disabled = desactive;
  b.addEventListener("click", action);
  return b;
}
function afficherPanier() {
  var liste = document.getElementById("basket-list");
  var vide = document.getElementById("basket-empty");
  var total = document.getElementById("basket-total");
  liste.innerHTML = "";
  var ids = idsPanier();
  if (ids.length === 0) {
    vide.hidden = false;
    total.hidden = true;
    return;
  }
  vide.hidden = true;
 ids.forEach(function (id) {
    var plat = trouverPlat(id);
    var qte = panier[id];
    var verrou = !!commandeEnregistree;
 var li = document.createElement("li");
   var nom = document.createElement("span");
    nom.textContent = plat.nom;
   var zoneQte = document.createElement("div");
    zoneQte.className = "qty";
    var n = document.createElement("span");
    n.className = "qty-n";
    n.textContent = qte;
    zoneQte.appendChild(creerBouton("−", "Retirer un " + plat.nom, function () { changerQuantite(id, -1); }, verrou));
    zoneQte.appendChild(n);
    zoneQte.appendChild(creerBouton("+", "Ajouter un " + plat.nom, function () { changerQuantite(id, 1); }, verrou || qte >= QTE_MAX));
    var prix = document.createElement("span");
    prix.className = "b-price";
    prix.textContent = formaterPrix(plat.prix * qte);
    li.appendChild(nom);
    li.appendChild(zoneQte);
    li.appendChild(prix);
    liste.appendChild(li);
  });
  total.hidden = false;
  total.textContent = "Total : " + formaterPrix(calculerTotal());
}
/* ---------- INFORMATIONS ÉTUDIANT ---------- */
function telephoneValide(valeur) {
  var nettoye = valeur.replace(/[\s.\-()]/g, "");
  return /^\+?\d{8,15}$/.test(nettoye);
}
function lireInfosEtudiant() {
  var champs = [
    { id: "student-name", libelle: "votre nom et prénom" },
    { id: "student-phone", libelle: "un numéro de téléphone valide", verif: telephoneValide },
    { id: "student-class", libelle: "votre classe" },
    { id: "student-campus", libelle: "votre campus" }
  ];
  var manquants = [];
  var valeurs = {};
  champs.forEach(function (c) {
    var el = document.getElementById(c.id);
    var valeur = el.value.trim();
    var ok = valeur !== "" && (!c.verif || c.verif(valeur));
    el.parentElement.classList.toggle("invalid", !ok);
    if (!ok) manquants.push(c.libelle);
    valeurs[c.id] = valeur;
  });
  if (manquants.length > 0) {
    var items = manquants.map(function (m) { return "<li>" + m + "</li>"; }).join("");
    afficherMessage("message-save", "error", "Veuillez renseigner :<ul>" + items + "</ul>");
    document.getElementById("infos").scrollIntoView();
    return null;
  }
  return {
    nom: valeurs["student-name"],
    tel: valeurs["student-phone"],
    classe: valeurs["student-class"],
    campus: valeurs["student-campus"]
  };
}
function verrouillerInfos(etat) {
  ["student-name", "student-phone", "student-class", "student-campus"].forEach(function (id) {
    document.getElementById(id).disabled = etat;
  });
}
/* ---------- HORAIRES ---------- */
function commandesOuvertes() {
  var heure = new Date().getHours();
  return heure >= 17 || heure < 5; // ouvert de 17h00 à 05h00
}
/* ---------- ÉTAPE 1 : ENREGISTRER LA COMMANDE ---------- */
async function enregistrerCommande() {
  if (commandeEnregistree) return;
  if (idsPanier().length === 0) {
    afficherMessage("message-save", "warn", "Votre panier est vide. Choisissez au moins un plat dans le menu.");
    document.getElementById("menu").scrollIntoView();
    return;
  }
  var infos = lireInfosEtudiant();
  if (!infos) return;
  if (VERIFIER_HORAIRES && !commandesOuvertes()) {
    afficherMessage("message-save", "warn", "Les commandes sont fermées pour le moment. Elles sont ouvertes chaque jour de 17h00 à 05h00.");
    return;
  }
  var commande = {
    nom: infos.nom,
    tel: infos.tel,
    classe: infos.classe,
    campus: infos.campus,
    items: idsPanier().map(function (id) { return { id: id, qty: panier[id] }; })
  };
  var bouton = document.getElementById("save-btn");
  bouton.disabled = true;
  bouton.textContent = "Enregistrement...";
  var rep;
  try {
    var requete = await fetch(URL_SHEET, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(commande)
    });
    rep = await requete.json();
  } catch (erreur) {
    afficherMessage("message-save", "error", "Impossible d'enregistrer votre commande. Vérifiez votre connexion et réessayez.");
    bouton.disabled = false;
    bouton.textContent = "Enregistrer ma commande";
    return;
  }
  if (!rep || !rep.ok) {
    afficherMessage("message-save", "error", echapper((rep && rep.message) || "La commande a été refusée. Réessayez."));
    bouton.disabled = false;
    bouton.textContent = "Enregistrer ma commande";
    return;
  }
 // La référence et le total viennent du serveur
  commandeEnregistree = { reference: rep.reference, total: rep.total, nom: infos.nom };
 var recap = idsPanier().map(function (id) {
    return "<li>" + panier[id] + " × " + echapper(trouverPlat(id).nom) + "</li>";
  }).join("");
  verrouillerInfos(true);
  actualiser();
  bouton.textContent = "Commande enregistrée ✓";
  afficherMessage(
    "message-save",
    "success",
    "Merci " + echapper(infos.nom) + " ! Votre commande est enregistrée.<br>" +
    "Référence : <strong>" + echapper(rep.reference) + "</strong>" +
    "<ul>" + recap + "</ul>" +
    "<p style=\"margin-top:10px\">Total : <strong>" + formaterPrix(rep.total) + "</strong><br>" +
    "Retrait au campus : " + echapper(infos.campus) + "<br>" +
    "Cliquez maintenant sur « Passer ma commande » pour payer avec Wave.</p>" +
    "<button type=\"button\" class=\"link-btn\" onclick=\"nouvelleCommande()\">Modifier / nouvelle commande</button>"
  );
  document.getElementById("pay-btn").disabled = false;
  document.getElementById("commande").scrollIntoView();
}
/* ---------- ÉTAPE 2 : PASSER LA COMMANDE (PAIEMENT WAVE) ---------- */
function passerCommande() {
  if (!commandeEnregistree) {
    afficherMessage("message", "warn", "Enregistrez d'abord votre commande dans la section Panier.");
    document.getElementById("panier").scrollIntoView();
    return;
  }
  var url = WAVE_LIEN + (WAVE_LIEN.indexOf("?") === -1 ? "?" : "&") + "amount=" + commandeEnregistree.total;
 afficherMessage(
    "message",
    "success",
    "Redirection vers Wave... Montant : " + formaterPrix(commandeEnregistree.total) +
    ". Référence : <strong>" + echapper(commandeEnregistree.reference) + "</strong>"
  );
  window.location.href = url;
}
/* ---------- NOUVELLE COMMANDE ---------- */
function nouvelleCommande() {
  panier = {};
  commandeEnregistree = null;
  verrouillerInfos(false);
  var bouton = document.getElementById("save-btn");
  bouton.disabled = false;
  bouton.textContent = "Enregistrer ma commande";
document.getElementById("pay-btn").disabled = true;
  document.getElementById("message-save").hidden = true;
  document.getElementById("message").hidden = true;
  actualiser();
  document.getElementById("menu").scrollIntoView();
}
/* ---------- DÉMARRAGE ---------- */
actualiser();
