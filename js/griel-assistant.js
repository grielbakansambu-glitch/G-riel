(function () {
    "use strict";

    /**
     * G-Riel Assistant
     * Interface globale du site G-Riel IT Garden
     *
     * Architecture :
     * - Un seul fichier JS
     * - Le widget HTML est créé automatiquement
     * - Fonctionne depuis les pages racine et les sous-dossiers
     * - Le CSS est chargé automatiquement
     * - Aucun appel API ici
     */

    // On capture currentScript immédiatement.
    // Il peut devenir null une fois l'événement DOMContentLoaded déclenché.
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

        /**
         * ---------------------------------------------------------
         * 1. Détermination automatique de la racine du site
         * ---------------------------------------------------------
         *
         * Le navigateur transforme déjà :
         *
         * ../js/griel-assistant.js
         * ../../js/griel-assistant.js
         *
         * en URL absolue.
         *
         * On peut donc toujours remonter de /js/ vers la racine.
         */

        const scriptUrl = new URL(
            scriptElement.src,
            window.location.href
        );

        const siteRoot = new URL("../", scriptUrl);


        /**
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
            cssLink.dataset.grielAssistant = "true";

            document.head.appendChild(cssLink);
        }


        /**
         * ---------------------------------------------------------
         * 3. Fonction utilitaire pour créer les éléments
         * ---------------------------------------------------------
         */

        function createElement(tag, attributes = {}, text = "") {

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

                        element.setAttribute(attribute, value);

                    }
                }
            );

            if (text) {
                element.textContent = text;
            }

            return element;
        }


        /**
         * ---------------------------------------------------------
         * 4. Conteneur principal
         * ---------------------------------------------------------
         */

        const assistant = createElement("div", {
            id: "g-riel-assistant"
        });


        /**
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


        /**
         * ---------------------------------------------------------
         * 6. Arrière-plan flou
         * ---------------------------------------------------------
         *
         * Cet élément couvre le site lorsque l'assistant est ouvert.
         * Le CSS contrôle son flou et sa transparence.
         */

        const backdrop = createElement("div", {
            id: "g-riel-assistant-backdrop"
        });


        /**
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


        /**
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


        /**
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


        /**
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


        /**
         * ---------------------------------------------------------
         * 11. Assemblage de la fenêtre
         * ---------------------------------------------------------
         */

        chatWindow.appendChild(header);
        chatWindow.appendChild(messages);
        chatWindow.appendChild(form);


        /**
         * ---------------------------------------------------------
         * 12. Insertion dans la page
         * ---------------------------------------------------------
         */

        document.body.appendChild(backdrop);

        assistant.appendChild(toggleButton);
        assistant.appendChild(chatWindow);

        document.body.appendChild(assistant);


        /**
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


        /**
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


        /**
         * ---------------------------------------------------------
         * 15. Événements
         * ---------------------------------------------------------
         */

        // Le logo fonctionne maintenant comme un véritable toggle :
        // fermé → ouvre
        // ouvert → ferme

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


        // Bouton X
        closeButton.addEventListener(
            "click",
            closeAssistant
        );


        // Clic sur l'arrière-plan flou
        backdrop.addEventListener(
            "click",
            closeAssistant
        );


        /**
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


        /**
         * ---------------------------------------------------------
         * 17. Formulaire temporaire
         * ---------------------------------------------------------
         *
         * Pour l'instant, aucune IA/API.
         * On prépare uniquement l'interface.
         */

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const message = input.value.trim();

                if (!message) {
                    return;
                }

                addMessage(message, "user");

                input.value = "";


                /**
                 * Réponse temporaire.
                 * Elle sera remplacée plus tard
                 * par le backend / l'IA.
                 */

                setTimeout(function () {

                    addMessage(
                        "L’interface est prête. La connexion à l’assistant intelligent sera ajoutée dans une prochaine étape.",
                        "bot"
                    );

                }, 400);

            }
        );


        /**
         * ---------------------------------------------------------
         * 18. Confirmation dans la console
         * ---------------------------------------------------------
         */

        console.log(
            "G-Riel Assistant : interface initialisée avec succès."
        );
    }


    /**
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