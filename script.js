/* =========================================================
   JN Food - script.js (version complète)
   ========================================================= */
/* ---------- RÉGLAGES ---------- */
var URL_SHEET = "https://script.google.com/macros/s/AKfycbyiwIBMtLVV5dz2B1wH9-iJJUHW6e2tLxSj89e6FYYi5IgO-Sf4M4BxTluXnXVhn1FsqQ/exec";
var NUMERO_WAVE = "0503565292";
var NOM_WAVE = "EBOUCLE JOAN";
// true = commandes seulement de 17h00 à 05h00 / false = toujours ouvert (pour tester)
var VERIFIER_HORAIRES = false;
var panier = []; // liste des id de plats choisis
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
function afficherMessage(type, html) {
  var msg = document.getElementById("message");
  msg.className = type;
  msg.innerHTML = html;
  msg.hidden = false;
}
/* ---------- MENU ---------- */
function afficherMenu() {
  var grille = document.getElementById("menu-grid");
  grille.innerHTML = "";
 MENU.forEach(function (plat) {
    var carte = document.createElement("div");
    carte.className = "dish";
    carte.setAttribute("role", "button");
    carte.setAttribute("tabindex", "0");
    carte.setAttribute("aria-pressed", panier.indexOf(plat.id) !== -1 ? "true" : "false");
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
  var position = panier.indexOf(id);
  if (position === -1) {
    panier.push(id);
  } else {
    panier.splice(position, 1);
  }
  afficherMenu();
  afficherPanier();
}
function afficherPanier() {
  var liste = document.getElementById("basket-list");
  var vide = document.getElementById("basket-empty");
  var total = document.getElementById("basket-total");
  liste.innerHTML = "";
 if (panier.length === 0) {
    vide.hidden = false;
    total.hidden = true;
    return;
  }
 vide.hidden = true;
  var somme = 0;
 panier.forEach(function (id) {
    var plat = trouverPlat(id);
    somme += plat.prix;
 var li = document.createElement("li");
    li.title = "Toucher pour retirer";
    var nom = document.createElement("span");
    nom.textContent = plat.nom;
    var prix = document.createElement("span");
    prix.textContent = formaterPrix(plat.prix);
    li.appendChild(nom);
    li.appendChild(prix);
    li.addEventListener("click", function () { basculerPlat(id); });
    liste.appendChild(li);
  });
total.hidden = false;
  total.textContent = "Total : " + formaterPrix(somme);
}
/* ---------- INFORMATIONS ÉTUDIANT ---------- */
function lireInfosEtudiant() {
  var champs = [
    { id: "student-name", libelle: "votre nom et prénom" },
    { id: "student-class", libelle: "votre classe" },
    { id: "student-campus", libelle: "votre campus" }
  ];
  var manquants = [];
  var valeurs = {};
champs.forEach(function (c) {
    var el = document.getElementById(c.id);
    var valeur = el.value.trim();
    el.parentElement.classList.toggle("invalid", !valeur);
    if (!valeur) manquants.push(c.libelle);
    valeurs[c.id] = valeur;
  });
  if (manquants.length > 0) {
    var items = manquants.map(function (m) { return "<li>" + m + "</li>"; }).join("");
    afficherMessage("error", "Veuillez renseigner :<ul>" + items + "</ul>");
    document.getElementById("infos").scrollIntoView();
    return null;
  }
  return {
    nom: valeurs["student-name"],
    classe: valeurs["student-class"],
    campus: valeurs["student-campus"]
  };
}
/* ---------- HORAIRES ---------- */
function commandesOuvertes() {
  var heure = new Date().getHours();
  return heure >= 17 || heure < 5; // ouvert de 17h00 à 05h00
}
/* ---------- PAIEMENT / ENVOI DE LA COMMANDE ---------- */
async function checkout() {
  if (panier.length === 0) {
    afficherMessage("warn", "Votre panier est vide. Choisissez au moins un plat dans le menu.");
    document.getElementById("menu").scrollIntoView();
    return;
  }
  var infos = lireInfosEtudiant();
  if (!infos) return;
 if (VERIFIER_HORAIRES && !commandesOuvertes()) {
    afficherMessage("warn", "Les commandes sont fermées pour le moment. Elles sont ouvertes chaque jour de 17h00 à 05h00.");
    return;
  }
 var somme = 0;
  panier.forEach(function (id) { somme += trouverPlat(id).prix; });
var noms = panier.map(function (id) { return trouverPlat(id).nom; });
  var reference = "JN-" + Math.floor(1000 + Math.random() * 9000);
var commande = {
    reference: reference,
    nom: infos.nom,
    classe: infos.classe,
    campus: infos.campus,
    plats: noms.join(", "),
    total: somme
  };
 var bouton = document.getElementById("checkout-btn");
  bouton.disabled = true;
  bouton.textContent = "Envoi en cours...";
 try {
    await fetch(URL_SHEET, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(commande)
    });
  } catch (erreur) {
    afficherMessage("error", "Impossible d'envoyer votre commande. Vérifiez votre connexion et réessayez.");
    bouton.disabled = false;
    bouton.textContent = "Payer ma commande";
    return;
  }
 var liste = noms.map(function (n) { return "<li>" + echapper(n) + "</li>"; }).join("");
afficherMessage(
    "success",
    "Merci " + echapper(infos.nom) + " ! Votre commande est enregistrée." +
    "<ul>" + liste + "</ul>" +
    "<p style=\"margin-top:10px\"><strong>Total : " + formaterPrix(somme) + "</strong><br>" +
    "Retrait au campus : " + echapper(infos.campus) + "</p>" +
    "<p style=\"margin-top:12px\"><strong>Pour valider, payez par Wave :</strong><br>" +
    "Numéro : " + echapper(NUMERO_WAVE) + " (" + echapper(NOM_WAVE) + ")<br>" +
    "Montant : " + formaterPrix(somme) + "<br>" +
    "Référence à indiquer : <strong>" + reference + "</strong></p>"
  );
 panier = [];
  afficherMenu();
  afficherPanier();
  bouton.disabled = false;
  bouton.textContent = "Payer ma commande";
}

/* ---------- DÉMARRAGE ---------- */
afficherMenu();
afficherPanier();
