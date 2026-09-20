(function () {
    "use strict";

    /*
     * G-Riel Assistant
     * Interface globale du site G-Riel IT Garden
     *
     * Architecture :
     * - Un seul fichier JS
     * - Le widget HTML est créé automatiquement
     * - Fonctionne depuis les pages racine et les sous-dossiers
     * - Le CSS est chargé automatiquement
     * - Communication avec le backend Cloudflare Worker
     * - Affichage Markdown sécurisé des réponses
     */

    // On capture currentScript immédiatement.
    const scriptElement = document.currentScript;

    function initAssistant() {

        // Évite une double initialisation
        if (document.getElementById("g-riel-assistant")) {
            return;
        }

        // Vérification du script
        if (!scriptElement || !scriptElement.src) {
            console.error(
                "G-Riel Assistant : impossible de déterminer le chemin du script."
            );
            return;
        }

        /*
         * ---------------------------------------------------------
         * 1. Détermination automatique de la racine du site
         * ---------------------------------------------------------
         */

        const scriptUrl = new URL(
            scriptElement.src,
            window.location.href
        );

        const siteRoot = new URL("../", scriptUrl);

        /*
         * ---------------------------------------------------------
         * 1 bis. Chargement de la mémoire G-Riel
         * ---------------------------------------------------------
         */

        let grielMemory = null;

        async function loadGrielMemory() {
            try {
                const memoryUrl = new URL(
                    "griel-memory.json",
                    siteRoot
                );

                const response = await fetch(memoryUrl);

                if (!response.ok) {
                    throw new Error(
                        `Impossible de charger griel-memory.json (${response.status})`
                    );
                }

                const memory = await response.json();

                console.log(
                    "🌱 G-Riel Memory chargée :",
                    memory
                );

                return memory;

            } catch (error) {
                console.error(
                    "❌ Erreur de chargement de la mémoire G-Riel :",
                    error
                );

                return null;
            }
        }

        /*
         * ---------------------------------------------------------
         * 1 ter. Chargement de la carte du Garden
         * ---------------------------------------------------------
         */

        let grielSiteMap = null;

        async function loadGrielSiteMap() {
            try {
                const siteMapUrl = new URL(
                    "site-map.json",
                    siteRoot
                );

                const response = await fetch(siteMapUrl);

                if (!response.ok) {
                    throw new Error(
                        `Impossible de charger site-map.json (${response.status})`
                    );
                }

                const siteMap = await response.json();

                console.log(
                    "🗺️ G-Riel Site Map chargée :",
                    siteMap
                );

                return siteMap;

            } catch (error) {
                console.error(
                    "❌ Erreur de chargement de site-map.json :",
                    error
                );

                return null;
            }
        }

        /*
         * ---------------------------------------------------------
         * 1 quater. Préparation du contexte G-Riel
         * ---------------------------------------------------------
         */

        function buildAssistantContext() {
            return {
                memory: grielMemory,
                site_map: grielSiteMap,
                page: {
                    url: window.location.href,
                    path: window.location.pathname,
                    title: document.title
                }
            };
        }

        /*
         * ---------------------------------------------------------
         * 1 quinquies. Chargement des sources
         * ---------------------------------------------------------
         */

        Promise.all([
            loadGrielMemory(),
            loadGrielSiteMap()
        ]).then(([memory, siteMap]) => {

            grielMemory = memory;
            grielSiteMap = siteMap;

            const context = buildAssistantContext();

            console.log(
                "🧠 Contexte G-Riel préparé :",
                context
            );

            console.log(
                "Nom :",
                grielMemory?.assistant?.name
            );

            console.log(
                "Garden :",
                grielMemory?.garden?.name
            );

            console.log(
                "Principe :",
                grielMemory?.assistant?.principle
            );
        });

        /*
         * ---------------------------------------------------------
         * 2. Chargement automatique du CSS
         * ---------------------------------------------------------
         */

        const cssUrl = new URL(
            "css/griel-assistant.css",
            siteRoot
        );

        if (
            !document.querySelector(
                'link[data-griel-assistant-css="true"]'
            )
        ) {
            const cssLink = document.createElement("link");

            cssLink.rel = "stylesheet";
            cssLink.href = cssUrl.href;
            cssLink.dataset.grielAssistantCss = "true";

            document.head.appendChild(cssLink);
        }

        /*
         * ---------------------------------------------------------
         * 3. Fonction utilitaire pour créer les éléments
         * ---------------------------------------------------------
         */

        function createElement(
            tag,
            attributes = {},
            text = ""
        ) {
            const element = document.createElement(tag);

            Object.entries(attributes).forEach(
                ([attribute, value]) => {

                    if (attribute === "className") {
                        element.className = value;

                    } else if (attribute === "dataset") {

                        Object.entries(value).forEach(
                            ([key, datasetValue]) => {
                                element.dataset[key] = datasetValue;
                            }
                        );

                    } else {
                        element.setAttribute(
                            attribute,
                            value
                        );
                    }
                }
            );

            if (text) {
                element.textContent = text;
            }

            return element;
        }

        /*
         * ---------------------------------------------------------
         * 4. Conteneur principal
         * ---------------------------------------------------------
         */

        const assistant = createElement("div", {
            id: "g-riel-assistant"
        });

        /*
         * ---------------------------------------------------------
         * 5. Bouton flottant
         * ---------------------------------------------------------
         */

        const toggleButton = createElement(
            "button",
            {
                id: "g-riel-assistant-toggle",
                type: "button",
                "aria-label": "Ouvrir G-Riel Assistant",
                title: "G-Riel Assistant"
            }
        );

        const assistantIcon = createElement("img", {
            src: new URL(
                "assets/images/griel-assistant.png",
                siteRoot
            ).href,
            alt: "G-Riel Assistant"
        });

        toggleButton.appendChild(assistantIcon);

        /*
         * ---------------------------------------------------------
         * 6. Arrière-plan flou
         * ---------------------------------------------------------
         */

        const backdrop = createElement("div", {
            id: "g-riel-assistant-backdrop"
        });

        /*
         * ---------------------------------------------------------
         * 7. Fenêtre de discussion
         * ---------------------------------------------------------
         */

        const chatWindow = createElement("section", {
            id: "g-riel-assistant-window",
            "aria-label": "G-Riel Assistant"
        });

        // État initial : fermé
        chatWindow.hidden = true;
        chatWindow.style.display = "none";

        /*
         * ---------------------------------------------------------
         * 8. En-tête
         * ---------------------------------------------------------
         */

        const header = createElement("header", {
            className: "griel-assistant-header"
        });

        const headerInfo = createElement(
            "div",
            {
                className: "griel-assistant-header-info"
            }
        );

        const headerTitle = createElement(
            "strong",
            {},
            "G-Riel Assistant"
        );

        const headerSubtitle = createElement(
            "span",
            {},
            "Explorer, comprendre, apprendre."
        );

        headerInfo.appendChild(headerTitle);
        headerInfo.appendChild(headerSubtitle);

        const closeButton = createElement(
            "button",
            {
                type: "button",
                className: "griel-assistant-close",
                "aria-label": "Fermer G-Riel Assistant",
                title: "Fermer"
            },
            "×"
        );

        header.appendChild(headerInfo);
        header.appendChild(closeButton);

        /*
         * ---------------------------------------------------------
         * 9. Zone des messages
         * ---------------------------------------------------------
         */

        const messages = createElement("div", {
            className: "griel-assistant-messages",
            "aria-live": "polite"
        });

        const welcomeMessage = createElement(
            "div",
            {
                className:
                    "griel-assistant-message " +
                    "griel-assistant-message-bot"
            },
            "Bonjour. Je suis G-Riel Assistant. Que souhaites-tu explorer dans le Garden ?"
        );

        messages.appendChild(welcomeMessage);

        /*
         * ---------------------------------------------------------
         * 10. Zone de saisie
         * ---------------------------------------------------------
         */

        const form = createElement("form", {
            className: "griel-assistant-form"
        });

        const input = createElement("input", {
            type: "text",
            className: "griel-assistant-input",
            placeholder: "Écrire un message...",
            autocomplete: "off",
            "aria-label": "Message"
        });

        const sendButton = createElement(
            "button",
            {
                type: "submit",
                className: "griel-assistant-send",
                "aria-label": "Envoyer",
                title: "Envoyer"
            },
            "➤"
        );

        form.appendChild(input);
        form.appendChild(sendButton);

        /*
         * ---------------------------------------------------------
         * 11. Assemblage de la fenêtre
         * ---------------------------------------------------------
         */

        chatWindow.appendChild(header);
        chatWindow.appendChild(messages);
        chatWindow.appendChild(form);

        /*
         * ---------------------------------------------------------
         * 12. Insertion dans la page
         * ---------------------------------------------------------
         */

        document.body.appendChild(backdrop);

        assistant.appendChild(toggleButton);
        assistant.appendChild(chatWindow);

        document.body.appendChild(assistant);

        /*
         * ---------------------------------------------------------
         * 13. Fonctions d'ouverture / fermeture
         * ---------------------------------------------------------
         */

        function openAssistant() {
            chatWindow.hidden = false;
            chatWindow.style.display = "flex";

            backdrop.classList.add("is-visible");

            input.focus();
        }

        function closeAssistant() {
            chatWindow.hidden = true;
            chatWindow.style.display = "none";

            backdrop.classList.remove("is-visible");

            toggleButton.focus();
        }

        /*
         * ---------------------------------------------------------
         * 14. Moteur Markdown sécurisé
         * ---------------------------------------------------------
         */

        function escapeHtml(text) {
            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function renderMarkdown(text) {

            let source = String(text ?? "");

            /*
             * -----------------------------------------------------
             * Protection des blocs de code
             * -----------------------------------------------------
             */

            const codeBlocks = [];

            source = source.replace(
                /```(?:[a-zA-Z0-9_-]+)?\s*\n?([\s\S]*?)```/g,
                function (_, code) {

                    const index = codeBlocks.length;

                    codeBlocks.push(
                        "<pre><code>" +
                        escapeHtml(
                            code.replace(/\n$/, "")
                        ) +
                        "</code></pre>"
                    );

                    return `@@GRIEL_CODE_BLOCK_${index}@@`;
                }
            );

            /*
             * -----------------------------------------------------
             * Protection du HTML
             * -----------------------------------------------------
             */

            let html = escapeHtml(source);

            /*
             * -----------------------------------------------------
             * Code inline
             * -----------------------------------------------------
             */

            const inlineCodes = [];

            html = html.replace(
                /`([^`\n]+)`/g,
                function (_, code) {

                    const index = inlineCodes.length;

                    inlineCodes.push(
                        "<code>" +
                        code +
                        "</code>"
                    );

                    return `@@GRIEL_INLINE_CODE_${index}@@`;
                }
            );

            /*
             * -----------------------------------------------------
             * Titres Markdown
             * -----------------------------------------------------
             */

            html = html.replace(
                /^### (.+)$/gm,
                "<h4>$1</h4>"
            );

            html = html.replace(
                /^## (.+)$/gm,
                "<h3>$1</h3>"
            );

            html = html.replace(
                /^# (.+)$/gm,
                "<h2>$1</h2>"
            );

            /*
             * -----------------------------------------------------
             * Liens Markdown
             * -----------------------------------------------------
             */

            const markdownLinks = [];

            html = html.replace(
                /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
                function (_, label, url) {

                    const index = markdownLinks.length;

                    markdownLinks.push(
                        '<a href="' +
                        url +
                        '" target="_blank" ' +
                        'rel="noopener noreferrer">' +
                        label +
                        "</a>"
                    );

                    return `@@GRIEL_MARKDOWN_LINK_${index}@@`;
                }
            );

            /*
             * -----------------------------------------------------
             * URLs simples
             * -----------------------------------------------------
             */

            html = html.replace(
                /(^|[\s>])(https?:\/\/[^\s<]+)/g,
                function (_, prefix, url) {

                    let cleanUrl = url;
                    let ending = "";

                    while (
                        /[.,!?;:]$/.test(cleanUrl)
                    ) {
                        ending =
                            cleanUrl.slice(-1) +
                            ending;

                        cleanUrl =
                            cleanUrl.slice(0, -1);
                    }

                    return (
                        prefix +
                        '<a href="' +
                        cleanUrl +
                        '" target="_blank" ' +
                        'rel="noopener noreferrer">' +
                        cleanUrl +
                        "</a>" +
                        ending
                    );
                }
            );

            /*
             * -----------------------------------------------------
             * Gras
             * -----------------------------------------------------
             */

            html = html.replace(
                /\*\*(.+?)\*\*/g,
                "<strong>$1</strong>"
            );

            /*
             * -----------------------------------------------------
             * Italique
             * -----------------------------------------------------
             */

            html = html.replace(
                /(?<!\*)\*([^\*\n]+)\*(?!\*)/g,
                "<em>$1</em>"
            );

            /*
             * -----------------------------------------------------
             * Listes non ordonnées
             * -----------------------------------------------------
             */

            const lines = html.split("\n");
            const output = [];

            let insideList = false;

            lines.forEach(function (line) {

                const listMatch =
                    line.match(/^\s*[-*]\s+(.+)$/);

                if (listMatch) {

                    if (!insideList) {
                        output.push("<ul>");
                        insideList = true;
                    }

                    output.push(
                        "<li>" +
                        listMatch[1] +
                        "</li>"
                    );

                    return;
                }

                if (insideList) {
                    output.push("</ul>");
                    insideList = false;
                }

                output.push(line);
            });

            if (insideList) {
                output.push("</ul>");
            }

            html = output.join("\n");

            /*
             * -----------------------------------------------------
             * Retours à la ligne
             * -----------------------------------------------------
             */

            html = html.replace(
                /\n/g,
                "<br>"
            );

            /*
             * -----------------------------------------------------
             * Nettoyage des <br> autour des blocs
             * -----------------------------------------------------
             */

            html = html.replace(
                /<br>\s*(<h[234]>)/g,
                "$1"
            );

            html = html.replace(
                /(<\/h[234]>)\s*<br>/g,
                "$1"
            );

            html = html.replace(
                /<br>\s*(<ul>)/g,
                "$1"
            );

            html = html.replace(
                /(<\/ul>)\s*<br>/g,
                "$1"
            );

            html = html.replace(
                /<br>\s*(<pre>)/g,
                "$1"
            );

            html = html.replace(
                /(<\/pre>)\s*<br>/g,
                "$1"
            );

            /*
             * -----------------------------------------------------
             * Restauration des liens Markdown
             * -----------------------------------------------------
             */

            markdownLinks.forEach(
                function (linkHtml, index) {

                    html = html.replace(
                        `@@GRIEL_MARKDOWN_LINK_${index}@@`,
                        linkHtml
                    );
                }
            );

            /*
             * -----------------------------------------------------
             * Restauration du code inline
             * -----------------------------------------------------
             */

            inlineCodes.forEach(
                function (codeHtml, index) {

                    html = html.replace(
                        `@@GRIEL_INLINE_CODE_${index}@@`,
                        codeHtml
                    );
                }
            );

            /*
             * -----------------------------------------------------
             * Restauration des blocs de code
             * -----------------------------------------------------
             */

            codeBlocks.forEach(
                function (codeHtml, index) {

                    html = html.replace(
                        `@@GRIEL_CODE_BLOCK_${index}@@`,
                        codeHtml
                    );
                }
            );

            return html;
        }

        /*
         * ---------------------------------------------------------
         * 15. Ajout d'un message
         * ---------------------------------------------------------
         */

        function addMessage(text, type) {

            const message = createElement("div", {
                className:
                    "griel-assistant-message " +
                    `griel-assistant-message-${type}`
            });

            if (type === "bot") {
                message.innerHTML = renderMarkdown(text);
            } else {
                message.textContent = text;
            }

            messages.appendChild(message);

            messages.scrollTop =
                messages.scrollHeight;

            return message;
        }

        /*
         * ---------------------------------------------------------
         * 16. Événements
         * ---------------------------------------------------------
         */

        toggleButton.addEventListener(
            "click",
            function () {

                if (chatWindow.hidden) {
                    openAssistant();
                } else {
                    closeAssistant();
                }
            }
        );

        closeButton.addEventListener(
            "click",
            closeAssistant
        );

        backdrop.addEventListener(
            "click",
            closeAssistant
        );

        /*
         * ---------------------------------------------------------
         * 17. Fermeture avec Escape
         * ---------------------------------------------------------
         */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    !chatWindow.hidden
                ) {
                    closeAssistant();
                }
            }
        );

        /*
         * ---------------------------------------------------------
         * 18. Communication avec le Cloudflare Worker
         * ---------------------------------------------------------
         */

        const WORKER_URL =
            "https://griel-assistant-backend.grielbakansambu.workers.dev";

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const message =
                    input.value.trim();

                if (!message) {
                    return;
                }

                // Affiche le message utilisateur
                addMessage(
                    message,
                    "user"
                );

                input.value = "";

                // Indicateur de chargement
                const loadingMessage =
                    addMessage(
                        "Réflexion en cours...",
                        "bot"
                    );

                try {

                    /*
                     * -------------------------------------------------
                     * Prépare le contexte complet
                     * -------------------------------------------------
                     */

                    const context =
                        buildAssistantContext();

                    /*
                     * -------------------------------------------------
                     * Appel du Worker
                     * -------------------------------------------------
                     */

                    const response =
                        await fetch(
                            WORKER_URL,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    message: message,
                                    context: context
                                })
                            }
                        );

                    /*
                     * -------------------------------------------------
                     * Lecture de la réponse JSON
                     * -------------------------------------------------
                     */

                    const data =
                        await response.json();

                    // Diagnostic complet
                    console.log(
                        "G-RIEL RESPONSE FULL:",
                        JSON.stringify(
                            data,
                            null,
                            2
                        )
                    );

                    // Supprime le message de chargement
                    loadingMessage.remove();

                    /*
                     * -------------------------------------------------
                     * Vérification de la réponse HTTP
                     * -------------------------------------------------
                     */

                    if (!response.ok) {
                        throw new Error(
                            data.error ||
                            "Erreur de communication avec le backend."
                        );
                    }

                    /*
                     * -------------------------------------------------
                     * Gemini Interactions API
                     *
                     * data.steps[]
                     *   └── type: "model_output"
                     *       └── content[]
                     *           └── type: "text"
                     *               └── text
                     * -------------------------------------------------
                     */

                    const botReply =
                        data.steps
                            ?.find(
                                step =>
                                    step.type ===
                                    "model_output"
                            )
                            ?.content
                            ?.find(
                                part =>
                                    part.type ===
                                    "text"
                            )
                            ?.text ||
                        "Désolé, je n'ai pas pu décoder la réponse.";

                    /*
                     * -------------------------------------------------
                     * Affiche réellement la réponse
                     * -------------------------------------------------
                     */

                    addMessage(
                        botReply,
                        "bot"
                    );

                } catch (error) {

                    console.error(
                        "Erreur G-Riel Assistant :",
                        error
                    );

                    /*
                     * Le message de chargement peut déjà avoir
                     * été supprimé avant l'erreur.
                     */

                    if (
                        loadingMessage &&
                        loadingMessage.isConnected
                    ) {
                        loadingMessage.remove();
                    }

                    addMessage(
                        "Oups, une erreur technique est survenue lors de la connexion au Worker.",
                        "bot"
                    );
                }
            }
        );

        /*
         * ---------------------------------------------------------
         * 19. Confirmation dans la console
         * ---------------------------------------------------------
         */

        console.log(
            "G-Riel Assistant : interface initialisée avec succès."
        );
    }

    /*
     * -------------------------------------------------------------
     * Initialisation sûre
     * -------------------------------------------------------------
     */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initAssistant
        );

    } else {

        initAssistant();
    }

})();