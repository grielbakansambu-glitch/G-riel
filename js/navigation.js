/*
 * ============================================
 * G-RIEL IT Garden — Navigation
 * ============================================
 */

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. MENU BURGER & OVERLAY
    // ==========================================

    const menuBtn = document.querySelector(".hamburger-btn");
    const menuOverlay = document.getElementById("menuOverlay");

    if (menuBtn && menuOverlay) {

        function toggleMenu() {
            const isOpen = menuOverlay.classList.toggle("open");

            menuBtn.setAttribute("aria-expanded", String(isOpen));
            menuOverlay.setAttribute("aria-hidden", String(!isOpen));

            document.body.style.overflow = isOpen ? "hidden" : "";
        }

        // Ouvrir / fermer le menu
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Fermer en cliquant sur l'arrière-plan
        menuOverlay.addEventListener("click", (e) => {
            if (e.target === menuOverlay) {
                toggleMenu();
            }
        });

        // Fermer avec la touche Échap
        document.addEventListener("keydown", (e) => {
            if (
                e.key === "Escape" &&
                menuOverlay.classList.contains("open")
            ) {
                toggleMenu();
            }
        });

        // Fermer le menu après avoir choisi un lien
        menuOverlay.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("click", () => {
                if (menuOverlay.classList.contains("open")) {
                    toggleMenu();
                }
            });
        });
    }


    // ==========================================
    // 2. LIEN ACTIF
    // ==========================================

    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".nav-link").forEach((link) => {

        const href = link.getAttribute("href");

        if (href === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }

    });


    // ==========================================
// 3. RECHERCHE
// ==========================================

const searchInput =
    document.querySelector(".header-search-bar input");

if (searchInput) {

    const items = document.querySelectorAll(
        ".tech-card, .hub-card, .mag-card, .note-card, .roadmap-mini-step, .principle-card, .tech-card, .hub-card, .mag-card, .note-card, .roadmap-mini-step, .principle-card, .value-card, .tool-card, .timeline-entry"
    );
    

    searchInput.addEventListener("input", (e) => {

        const query = e.target.value.toLowerCase().trim();

        items.forEach((item) => {

            const text = item.textContent.toLowerCase();

            if (query === "" || text.includes(query)) {
                item.style.display = "";
            } else {
                item.style.display = "none";
            }

        });

    });
 }

});