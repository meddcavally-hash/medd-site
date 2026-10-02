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
  var galleryImages = document.querySelectorAll(".news-card img");
  if (galleryImages.length === 0) return;

  var overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "Image agrandie");
  overlay.innerHTML =
    '<button type="button" class="lightbox-close" aria-label="Fermer">&times;</button>' +
    '<img class="lightbox-img" src="" alt="">';
  document.body.appendChild(overlay);

  var lightboxImg = overlay.querySelector(".lightbox-img");
  var closeBtn = overlay.querySelector(".lightbox-close");

  function openLightbox(img) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    overlay.classList.add("is-open");
  }

  function closeLightbox() {
    overlay.classList.remove("is-open");
    lightboxImg.src = "";
  }

  galleryImages.forEach(function (img) {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", function () {
      openLightbox(img);
    });
  });

  overlay.addEventListener("click", closeLightbox);
  closeBtn.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });
});
