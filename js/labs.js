/* ==========================================================================
   G-RIEL IT Garden - Script Interactif des Laboratoires (labs.js) - v1.0
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initReadingProgress();
    initActiveSidebar();
    initCopyButtons();
    initBackToTop();
    initImageLightbox();
});

/* --------------------------------------------------------------------------
   1. Barre de progression de lecture
   -------------------------------------------------------------------------- */
function initReadingProgress() {
    let progressBar = document.getElementById('reading-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'reading-progress';
        document.body.prepend(progressBar);
    }

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

/* --------------------------------------------------------------------------
   2. Sommaire actif (Met en surbrillance la section visible)
   -------------------------------------------------------------------------- */
function initActiveSidebar() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.lab-sidebar a');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

/* --------------------------------------------------------------------------
   3. Bouton Copier le code avec retour visuel
   -------------------------------------------------------------------------- */
function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const codeWrapper = button.closest('.code-wrapper');
            const codeBlock = codeWrapper ? codeWrapper.querySelector('pre code, pre') : null;

            if (!codeBlock) return;

            const textToCopy = codeBlock.innerText;

            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = button.innerText;
                button.innerText = '✅ Copié !';
                button.style.backgroundColor = '#10b981';
                button.style.borderColor = '#10b981';
                button.style.color = '#ffffff';

                setTimeout(() => {
                    button.innerText = originalText;
                    button.style.backgroundColor = '';
                    button.style.borderColor = '';
                    button.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Erreur lors de la copie : ', err);
            });
        });
    });
}

/* --------------------------------------------------------------------------
   4. Bouton Retour en haut (Back to top) - Anti-doublon inclus
   -------------------------------------------------------------------------- */
function initBackToTop() {
    if (document.querySelector('.back-to-top-btn')) return;

    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerText = '↑';
    backToTopBtn.setAttribute('aria-label', 'Retour en haut');
    backToTopBtn.className = 'back-to-top-btn';
    
    Object.assign(backToTopBtn.style, {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent-blue)',
        color: '#ffffff',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '999',
        transition: 'opacity 0.3s, transform 0.3s'
    });

    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* --------------------------------------------------------------------------
   5. Zoom des images (Lightbox simple avec fermeture Échap)
   -------------------------------------------------------------------------- */
function initImageLightbox() {
    const images = document.querySelectorAll('.lab-image-container img');

    images.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            // Évite d'ouvrir plusieurs overlays si on clique frénétiquement
            if (document.querySelector('.lab-lightbox')) return;

            const overlay = document.createElement('div');
            overlay.className = 'lab-lightbox';
            Object.assign(overlay.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '2000',
                cursor: 'zoom-out',
                padding: '2rem'
            });

            const zoomedImg = document.createElement('img');
            zoomedImg.src = img.src;
            zoomedImg.alt = img.alt;
            Object.assign(zoomedImg.style, {
                maxWidth: '90%',
                maxHeight: '90%',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            });

            overlay.appendChild(zoomedImg);
            document.body.appendChild(overlay);

            overlay.addEventListener('click', () => {
                overlay.remove();
            });
        });
    });

    // Fermeture de la lightbox avec la touche Échap
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            document.querySelector(".lab-lightbox")?.remove();
        }
    });
}

/* --------------------------------------------------------------------------
   6. Gestion de la modale de feedback (Remarques / Erreurs)
   -------------------------------------------------------------------------- */
function openModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) modal.style.display = 'none';
}

function submitFeedback(event) {
    event.preventDefault();
    alert('Merci ! Votre retour a bien été pris en compte pour améliorer ce laboratoire.');
    closeModal();
}

/* --------------------------------------------------------------------------
   7. Téléchargement de script simulé / direct
   -------------------------------------------------------------------------- */
function downloadScript(filename = "script.sh", content = "#!/bin/bash\n# G-RIEL IT Garden") {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}