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
                    "griel-assistant-message griel-assistant-message-bot"
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
         * 14. Ajout d'un message
         * ---------------------------------------------------------
         */

        function addMessage(text, type) {
            const message = createElement(
                "div",
                {
                    className:
                        "griel-assistant-message " +
                        "griel-assistant-message-" +
                        type
                },
                text
            );

            messages.appendChild(message);

            messages.scrollTop = messages.scrollHeight;

            return message;
        }

        /*
         * ---------------------------------------------------------
         * 15. Événements
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
         * 16. Fermeture avec Escape
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
         * 17. Communication avec le Cloudflare Worker
         * ---------------------------------------------------------
         */

        const WORKER_URL =
            "https://griel-assistant-backend.grielbakansambu.workers.dev";

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const message = input.value.trim();

                if (!message) {
                    return;
                }

                // Affiche le message utilisateur
                addMessage(message, "user");

                input.value = "";

                // Indicateur de chargement
                const loadingMessage = addMessage(
                    "Réflexion en cours...",
                    "bot"
                );

                try {

                    // Prépare le contexte complet
                    const context = buildAssistantContext();

                    const response = await fetch(
                        WORKER_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                message: message,
                                context: context
                            })
                        }
                    );

                    const data = await response.json();

                    // Diagnostic complet
                    console.log(
                        "G-RIEL RESPONSE FULL:",
                        JSON.stringify(data, null, 2)
                    );

                    // Supprime le message de chargement
                    loadingMessage.remove();

                    if (!response.ok) {
                        throw new Error(
                            data.error ||
                            "Erreur de communication avec le backend."
                        );
                    }

                    /*
                     * Gemini Interactions API :
                     *
                     * data.steps[]
                     *   └── type: "model_output"
                     *       └── content[]
                     *           └── type: "text"
                     *               └── text
                     */

                    const botReply =
                        data.steps
                            ?.find(
                                step =>
                                    step.type === "model_output"
                            )
                            ?.content
                            ?.find(
                                part =>
                                    part.type === "text"
                            )
                            ?.text ||
                        "Désolé, je n'ai pas pu décoder la réponse.";

                    // IMPORTANT :
                    // Affiche réellement la réponse de l'assistant
                    addMessage(botReply, "bot");

                } catch (error) {

                    console.error(
                        "Erreur G-Riel Assistant :",
                        error
                    );

                    loadingMessage.remove();

                    addMessage(
                        "Oups, une erreur technique est survenue lors de la connexion au Worker.",
                        "bot"
                    );
                }
            }
        );

        /*
         * ---------------------------------------------------------
         * 18. Confirmation dans la console
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
