/* --- Style des cartes avec images --- */
.dish {
  background: var(--surface);
  border: 2px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden; /* Garde les angles arrondis sur l'image */
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
}
.dish:hover {
  transform: translate(-3px, -3px);
  box-shadow: 5px 5px 0 var(--line);
}
/* Zone d'image carrée ou rectangulaire fixe */
.dish-img {
  width: 100%;
  height: 180px; /* Hauteur fixe pour aligner parfaitement toutes les cartes */
  border-bottom: 2px solid var(--line);
  overflow: hidden;
  background: var(--bg);
}
.dish-img img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Recadre intelligemment l'image au centre sans la déformer */
  transition: transform .3s ease;
}
/* Effet zoom discret sur la photo au survol */
.dish:hover .dish-img img {
  transform: scale(1.04);
}
/* Zone de texte sous la photo */
.dish-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
