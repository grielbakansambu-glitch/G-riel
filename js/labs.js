/* ==========================================================================
   G-RIEL IT Garden - Script Interactif des Laboratoires
   labs.js - v2.0
   ========================================================================== */


/* ==========================================================================
   SUPABASE — CONFIGURATION
   ========================================================================== */

const SUPABASE_URL = "https://xlvsnjxjabtzwdunbgvf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Ld6hN9d53US7eJVwdj287A_sFBfSSrQ";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* ==========================================================================
   ÉTAT DU LABORATOIRE
   ========================================================================== */

let currentLabId = null;


/* ==========================================================================
   INITIALISATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    // Fonctionnalités existantes
    initReadingProgress();
    initActiveSidebar();
    initCopyButtons();
    initBackToTop();
    initImageLightbox();

    // Base de données
    await initLaboratory();
});


/* ==========================================================================
   LABORATOIRE — AUTO-ENREGISTREMENT
   ========================================================================== */

async function initLaboratory() {

    const labSlug = document.body.dataset.labSlug;
    const labCategory = document.body.dataset.labCategory || "Général";
    const labTitle =
        document.querySelector("h1")?.textContent.trim() ||
        document.title;

    if (!labSlug) {
        console.warn(
            "G-RIEL IT Garden : data-lab-slug absent du <body>."
        );
        return;
    }

    try {

        const { data, error } = await supabaseClient.rpc(
            "get_or_create_laboratory",
            {
                p_slug: labSlug,
                p_title: labTitle,
                p_category: labCategory
            }
        );

        if (error) {
            console.error(
                "G-RIEL IT Garden — erreur initialisation lab :",
                error
            );
            return;
        }

        currentLabId = data;

        console.log(
            "G-RIEL IT Garden — laboratoire initialisé :",
            {
                slug: labSlug,
                id: currentLabId
            }
        );

    } catch (error) {

        console.error(
            "G-RIEL IT Garden — erreur inattendue :",
            error
        );

    }
}


/* ==========================================================================
   1. BARRE DE PROGRESSION
   ========================================================================== */

function initReadingProgress() {

    let progressBar = document.getElementById('reading-progress');

    if (!progressBar) {

        progressBar = document.createElement('div');
        progressBar.id = 'reading-progress';

        document.body.prepend(progressBar);
    }

    window.addEventListener('scroll', () => {

        const winScroll =
            document.documentElement.scrollTop;

        const height =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;

        const scrolled =
            height > 0
                ? (winScroll / height) * 100
                : 0;

        progressBar.style.width =
            scrolled + '%';
    });
}


/* ==========================================================================
   2. SOMMAIRE ACTIF
   ========================================================================== */

function initActiveSidebar() {

    const sections =
        document.querySelectorAll('section[id]');

    const navLinks =
        document.querySelectorAll('.lab-sidebar a');

    if (
        sections.length === 0 ||
        navLinks.length === 0
    ) {
        return;
    }

    const observerOptions = {

        root: null,

        rootMargin:
            '-20% 0px -60% 0px',

        threshold: 0
    };

    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        const id =
                            entry.target.getAttribute('id');

                        navLinks.forEach(link => {

                            link.classList.remove('active');

                            if (
                                link.getAttribute('href') ===
                                `#${id}`
                            ) {
                                link.classList.add('active');
                            }

                        });
                    }

                });

            },
            observerOptions
        );

    sections.forEach(section =>
        observer.observe(section)
    );
}


/* ==========================================================================
   3. COPIE DU CODE
   ========================================================================== */

function initCopyButtons() {

    const copyButtons =
        document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {

        button.addEventListener('click', () => {

            const codeWrapper =
                button.closest('.code-wrapper');

            const codeBlock =
                codeWrapper
                    ? codeWrapper.querySelector('pre code, pre')
                    : null;

            if (!codeBlock) return;

            const textToCopy =
                codeBlock.innerText;

            navigator.clipboard
                .writeText(textToCopy)
                .then(() => {

                    const originalText =
                        button.innerText;

                    button.innerText =
                        '✅ Copié !';

                    button.style.backgroundColor =
                        '#10b981';

                    button.style.borderColor =
                        '#10b981';

                    button.style.color =
                        '#ffffff';

                    setTimeout(() => {

                        button.innerText =
                            originalText;

                        button.style.backgroundColor =
                            '';

                        button.style.borderColor =
                            '';

                        button.style.color =
                            '';

                    }, 2000);

                })
                .catch(error => {

                    console.error(
                        'Erreur lors de la copie :',
                        error
                    );

                });
        });
    });
}


/* ==========================================================================
   4. RETOUR EN HAUT
   ========================================================================== */

function initBackToTop() {

    if (
        document.querySelector('.back-to-top-btn')
    ) {
        return;
    }

    const backToTopBtn =
        document.createElement('button');

    backToTopBtn.innerText = '↑';

    backToTopBtn.setAttribute(
        'aria-label',
        'Retour en haut'
    );

    backToTopBtn.className =
        'back-to-top-btn';

    Object.assign(
        backToTopBtn.style,
        {
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
        }
    );

    document.body.appendChild(
        backToTopBtn
    );

    window.addEventListener('scroll', () => {

        backToTopBtn.style.display =
            window.scrollY > 400
                ? 'flex'
                : 'none';

    });

    backToTopBtn.addEventListener(
        'click',
        () => {

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

        }
    );
}


/* ==========================================================================
   5. LIGHTBOX
   ========================================================================== */

function initImageLightbox() {

    const images =
        document.querySelectorAll(
            '.lab-image-container img'
        );

    images.forEach(img => {

        img.style.cursor = 'zoom-in';

        img.addEventListener('click', () => {

            if (
                document.querySelector(
                    '.lab-lightbox'
                )
            ) {
                return;
            }

            const overlay =
                document.createElement('div');

            overlay.className =
                'lab-lightbox';

            Object.assign(
                overlay.style,
                {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100vw',
                    height: '100vh',
                    backgroundColor:
                        'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '2000',
                    cursor: 'zoom-out',
                    padding: '2rem'
                }
            );

            const zoomedImg =
                document.createElement('img');

            zoomedImg.src =
                img.src;

            zoomedImg.alt =
                img.alt;

            Object.assign(
                zoomedImg.style,
                {
                    maxWidth: '90%',
                    maxHeight: '90%',
                    borderRadius: '8px',
                    boxShadow:
                        '0 10px 30px rgba(0,0,0,0.5)'
                }
            );

            overlay.appendChild(
                zoomedImg
            );

            document.body.appendChild(
                overlay
            );

            overlay.addEventListener(
                'click',
                () => overlay.remove()
            );
        });
    });

    document.addEventListener(
        "keydown",
        e => {

            if (e.key === "Escape") {

                document
                    .querySelector(
                        ".lab-lightbox"
                    )
                    ?.remove();

            }

        }
    );
}


/* ==========================================================================
   6. FEEDBACK — OUVERTURE / FERMETURE
   ========================================================================== */

function openModal() {

    const modal =
        document.getElementById(
            'feedbackModal'
        );

    if (modal) {
        modal.style.display = 'flex';
    }
}


function closeModal() {

    const modal =
        document.getElementById(
            'feedbackModal'
        );

    if (modal) {
        modal.style.display = 'none';
    }
}


/* ==========================================================================
   7. FEEDBACK — ENREGISTREMENT SUPABASE
   ========================================================================== */

async function submitFeedback(event) {

    event.preventDefault();

    if (!currentLabId) {

        alert(
            "Le laboratoire n'est pas encore initialisé. " +
            "Veuillez patienter quelques secondes."
        );

        return;
    }

    const form =
        event.target;

    const name =
        form.querySelector(
            'input[type="text"]'
        )?.value.trim() || null;

    const email =
        form.querySelector(
            'input[type="email"]'
        )?.value.trim() || null;

    const type =
        form.querySelector(
            'select'
        )?.value;

    const message =
        form.querySelector(
            'textarea'
        )?.value.trim();

    if (!message) {

        alert(
            "Veuillez saisir votre message."
        );

        return;
    }

    const typeMapping = {

        erreur: "error",

        suggestion: "suggestion",

        question: "question",

        compliment: "praise"

    };

    const feedbackCode =
        typeMapping[type];

    if (!feedbackCode) {

        alert(
            "Type de remarque invalide."
        );

        return;
    }

    try {

        /* --------------------------------------------------------------
           Récupération du type de feedback
        -------------------------------------------------------------- */

        const {
            data: feedbackType,
            error: typeError
        } =
            await supabaseClient
                .from("feedback_types")
                .select("id")
                .eq(
                    "code_name",
                    feedbackCode
                )
                .single();

        if (
            typeError ||
            !feedbackType
        ) {

            console.error(
                "Erreur type feedback :",
                typeError
            );

            alert(
                "Impossible de déterminer le type de remarque."
            );

            return;
        }


        /* --------------------------------------------------------------
           Enregistrement du feedback
        -------------------------------------------------------------- */

        const {
            error: feedbackError
        } =
            await supabaseClient
                .from("lab_feedbacks")
                .insert({

                    lab_id:
                        currentLabId,

                    feedback_type_id:
                        feedbackType.id,

                    author_name:
                        name,

                    author_email:
                        email,

                    message:
                        message,

                    status:
                        "nouveau"

                });

        if (feedbackError) {

            console.error(
                "Erreur feedback :",
                feedbackError
            );

            alert(
                "Une erreur est survenue lors de l'envoi."
            );

            return;
        }


        /* --------------------------------------------------------------
           Succès
        -------------------------------------------------------------- */

        alert(
            "Merci ! Votre remarque a bien été envoyée."
        );

        form.reset();

        closeModal();

    } catch (error) {

        console.error(
            "Erreur inattendue feedback :",
            error
        );

        alert(
            "Une erreur inattendue est survenue."
        );
    }
}


/* ==========================================================================
   8. TÉLÉCHARGEMENT DE SCRIPT
   ========================================================================== */

function downloadScript(
    filename = "script.sh",
    content = "#!/bin/bash\n# G-RIEL IT Garden"
) {

    const element =
        document.createElement('a');

    const file =
        new Blob(
            [content],
            { type: 'text/plain' }
        );

    element.href =
        URL.createObjectURL(file);

    element.download =
        filename;

    document.body.appendChild(
        element
    );

    element.click();

    document.body.removeChild(
        element
    );
}


/* ==========================================================================
   9. FERMETURE DU MODAL EN CLIQUANT À L'EXTÉRIEUR
   ========================================================================== */

window.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "feedbackModal"
            );

        if (
            modal &&
            event.target === modal
        ) {
            closeModal();
        }

    }
);