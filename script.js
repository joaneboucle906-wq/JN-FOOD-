// Tableau pour stocker les plats sélectionnés par l'étudiant
let basket = [];
/**
 * Fonction appelée au clic sur une carte de plat
 * @param {HTMLElement} element - La carte cliquée
 */
function toggleDish(element) {
  const dishId = element.getAttribute('data-id');
  const dishName = element.querySelector('.dish-content h3').innerText;
 // Vérifier si le plat est déjà dans le panier numérique
  const existingIndex = basket.findIndex(item => item.id === dishId);
  if (existingIndex > -1) {
    // Si le plat y est déjà, on l'enlève du tableau
    basket.splice(existingIndex, 1);
    element.removeAttribute('aria-pressed'); // Retire le style visuel sombre
  } else {
    // Si le plat n'y est pas, on l'ajoute au tableau
    basket.push({ id: dishId, name: dishName });
    element.setAttribute('aria-pressed', 'true'); // Applique le style visuel sombre
  }
  // Mettre à jour l'affichage de la liste en bas du menu
  updateBasketUI();
}
/**
 * Fonction pour actualiser l'affichage du panier sur la page
 */
function updateBasketUI() {
  const itemsContainer = document.getElementById('basket-items');
  const emptyMessage = document.getElementById('basket-empty');
  // On vide le conteneur avant de le reconstruire
  itemsContainer.innerHTML = '';
  // Si le panier est vide, on réaffiche le message d'aide
  if (basket.length === 0) {
    emptyMessage.style.display = 'block';
    return;
  }
 // Masquer le message "Panier vide"
  emptyMessage.style.display = 'none';
 // Ajouter chaque plat sélectionné sous forme de puce stylisée
  basket.forEach(item => {
    const li = document.createElement('li');
    li.innerText = item.name;
    itemsContainer.appendChild(li);
  });
}

/**
 * Fonction finale lors du clic sur "Confirmer ma commande"
 */
function checkout() {
  const now = new Date();
  const currentHour = now.getHours();
  const errorBanner = document.getElementById('time-error');
 // Contrôle des horaires du service : Bloqué entre 05h00 et 16h59
  if (currentHour >= 5 && currentHour < 17) {
    errorBanner.style.style.display = 'block';
    return;
  }
 errorBanner.style.display = 'none';
 // Alerte si l'étudiant clique sans avoir choisi de repas
  if (basket.length === 0) {
    alert('Votre panier numérique est vide. Veuillez sélectionner un plat avant de confirmer.');
    return;
  }
  // Synthèse des plats choisis
  const orderedDishes = basket.map(item => item.name).join(', ');
    // Message de confirmation avant redirection
  alert(`Commande enregistrée avec succès !\nPlats : ${orderedDishes}\n\nPréparation de la redirection sécurisée vers l'application Wave...`);
}
