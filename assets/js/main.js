// MEDD — site vitrine
// Script volontairement minimal : menu mobile + lightbox pour les images des actualités.
// Aucune dépendance externe, aucun appel réseau.

document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Ferme le menu mobile si on clique un lien (navigation vers une autre page)
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------- Lightbox : agrandissement des images des cartes actualités ----------
  // Délégation d'événement : fonctionne aussi pour les cartes affichées après le
  // chargement de la page (actualités lues depuis content/actualites.json).
  // La fenêtre d'agrandissement n'est créée qu'au premier clic sur une image.
  var overlay = null;
  var lightboxImg = null;

  function closeLightbox() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    lightboxImg.src = "";
  }

  function openLightbox(img) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "lightbox-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-label", "Image agrandie");
      overlay.innerHTML =
        '<button type="button" class="lightbox-close" aria-label="Fermer">&times;</button>' +
        '<img class="lightbox-img" src="" alt="">';
      document.body.appendChild(overlay);
      lightboxImg = overlay.querySelector(".lightbox-img");
      // Un clic n'importe où sur la fenêtre (y compris le bouton ×) la ferme
      overlay.addEventListener("click", closeLightbox);
    }
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    overlay.classList.add("is-open");
  }

  document.addEventListener("click", function (e) {
    var img = e.target.closest ? e.target.closest(".news-card img") : null;
    if (img) openLightbox(img);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });
});
