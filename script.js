/* =========================================================
   JN Food - script.js (version simple : quantités + téléphone)
   ========================================================= */

/* ---------- RÉGLAGES ---------- */
var URL_SHEET = "https://script.google.com/macros/s/AKfycbwm1BRsY_jM5eO5MqTAFaJ2D_sS_WS028xckXPWF70gXC0TSkig7zMzPsyxelKtV0ReTQ/exec";
var WAVE_LIEN = "https://pay.wave.com/m/M_ci_JbW10MlZ1A4Y/c/ci/";

// true = commandes seulement de 17h00 à 05h00 / false = toujours ouvert (pour tester)
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

/*
