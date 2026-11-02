"use strict";
/* Panier : tableau vide au départ. Chaque entrée = { id, title, price, showPrice }. */
var basket = [];
var listEl = document.getElementById("basket-list");
var emptyEl = document.getElementById("basket-empty");
var messageEl = document.getElementById("message");
/* Ajoute ou retire un plat au clic sur sa carte. */
function toggleDish(element) {
  if (!element) return;
  var id = element.dataset.id;
  var titleEl = element.querySelector("h3");
  if (!id || !titleEl) return;
  var title = titleEl.textContent.trim();
  var price = Number(element.dataset.price) || 0;
var index = basket.findIndex(function (item) { return item.id === id; });
 if (index > -1) {
    basket.splice(index, 1);
    element.removeAttribute("aria-pressed");   // retire l'état visuel de sélection
  } else {
    basket.push({ id: id, title: title, price: price, showPrice: false });
    element.setAttribute("aria-pressed", "true");
  }
 clearMessage();
  updateBasketUI();
}
/* Clic sur un plat dans le panier : affiche ou masque son prix. */
function togglePrice(id) {
  var item = basket.find(function (i) { return i.id === id; });
  if (!item) return;
  item.showPrice = !item.showPrice;
  updateBasketUI();
}
/* Met à jour la liste du panier en temps réel. */
function updateBasketUI() {
  listEl.innerHTML = "";
 basket.forEach(function (item) {
    var li = document.createElement("li");
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute("aria-expanded", item.showPrice ? "true" : "false");
    li.textContent = item.showPrice
      ? item.title + " (" + item.price + " F)"
      : item.title;
    li.addEventListener("click", function () { togglePrice(item.id); });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        togglePrice(item.id);
      }
    });
    listEl.appendChild(li);
  });
emptyEl.hidden = basket.length > 0;          // masque "panier vide" si au moins un plat
}
/* Affiche un message. type : "error" | "warn" | "success" */
function showMessage(type, text, items) {
  messageEl.className = type;
  messageEl.textContent = text;
 if (items && items.length) {
    var ul = document.createElement("ul");
    items.forEach(function (name) {
      var li = document.createElement("li");
      li.textContent = name;
      ul.appendChild(li);
    });
    messageEl.appendChild(ul);
  }
  messageEl.hidden = false;
}
function clearMessage() {
  messageEl.hidden = true;
  messageEl.textContent = "";
  messageEl.className = "";
}
/* Commande ouverte de 17h00 à 04h59 (heure locale de l'utilisateur). */
function isOrderingOpen() {
  var hour = new Date().getHours();
  return hour >= 17 || hour < 5;
}
/* Validation de la commande. */
function checkout() {
  if (!isOrderingOpen()) {
    showMessage("error", "Les commandes sont fermées. Vous pouvez commander chaque jour de 17h00 à 05h00 du matin.");
    return;
  }
  if (basket.length === 0) {
    showMessage("warn", "Votre panier est vide. Choisissez au moins un plat avant de commander.");
    return;
  }
 var titles = basket.map(function (item) { return item.title; });
  showMessage("success", "Commande validée ! Plats choisis :", titles);
/* Ici : appel à votre système de paiement (par exemple Wave). */
}
/* Construit les cartes du menu à partir de la liste MENU (menu.js). */
function renderMenu() {
  var grid = document.getElementById("menu-grid");
  if (!grid) return;
  grid.innerHTML = "";
 if (typeof MENU === "undefined" || !MENU.length) {
    var p = document.createElement("p");
    p.className = "intro";
    p.textContent = "Le menu du jour sera bientôt disponible.";
    grid.appendChild(p);
    return;
  }
 MENU.forEach(function (d) {
    var card = document.createElement("div");
    card.className = "dish";
    card.dataset.id = d.id;
    card.dataset.price = d.prix;
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.setAttribute("aria-pressed", "false");
 var imgWrap = document.createElement("div");
    imgWrap.className = "dish-img";
    var img = document.createElement("img");
    img.src = d.image;
    img.alt = d.nom;
    img.addEventListener("error", function () { img.style.display = "none"; });
    imgWrap.appendChild(img);
 var text = document.createElement("div");
    text.className = "dish-text";
    var badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = d.categorie;
    var h3 = document.createElement("h3");
    h3.textContent = d.nom;
    var desc = document.createElement("p");
    desc.textContent = d.description;
    text.appendChild(badge);
    text.appendChild(h3);
    text.appendChild(desc);
 card.appendChild(imgWrap);
    card.appendChild(text);
  card.addEventListener("click", function () { toggleDish(card); });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleDish(card);
      }
    });
    grid.appendChild(card);
  });
}
renderMenu();
updateBasketUI();
