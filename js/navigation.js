/* ============================================
   G-RIEL IT Garden — Navigation
   ============================================ */

(function() {
  'use strict';

  const menuBtn = document.getElementById('menuBtn');
  const menuOverlay = document.getElementById('menuOverlay');

  if (!menuBtn || !menuOverlay) return;

  function toggleMenu() {
    const isOpen = menuOverlay.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuOverlay.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu();
  });

  menuOverlay.addEventListener('click', function(e) {
    if (e.target === menuOverlay) toggleMenu();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menuOverlay.classList.contains('open')) {
      toggleMenu();
    }
  });

  // Active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function(link) {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

})();

/* ==========================================================================
   G-RIEL IT Garden — Script Global (Navigation, Menu Burger & Recherche)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. GESTION DU MENU BURGER & OVERLAY MOBILE
    // ==========================================
    const menuBtn = document.querySelector(".hamburger-btn");
    const overlay = document.getElementById("menuOverlay");

    if (menuBtn && overlay) {
        menuBtn.addEventListener("click", () => {
            overlay.classList.toggle("active");
            document.body.classList.toggle("menu-open");
        });

        // Fermer le menu si on clique en dehors du panneau (sur l'overlay sombre)
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("active");
                document.body.classList.remove("menu-open");
            }
        });
    }

    // ==========================================
    // 2. GESTION DE LA RECHERCHE DANS LE HEADER
    // ==========================================
    const searchInput = document.querySelector('.header-search-bar input');
    
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            // Sélectionne les cartes de laboratoires, articles ou blocs de contenu de ta page
            const items = document.querySelectorAll('.lab-card, .card, article, .item-list, section');

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (query === "" || text.includes(query)) {
                    item.style.display = ""; // Affiche l'élément si la recherche correspond ou si le champ est vide
                } else {
                    item.style.display = "none"; // Masque l'élément
                }
            });
        });
    }
});