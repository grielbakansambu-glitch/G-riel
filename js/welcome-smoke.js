(() => {
  "use strict";

  /*
   * ============================================================
   * G-RIEL IT Garden — Welcome Smoke V3
   * ============================================================
   *
   * Message :
   *   Bienvenue dans mon jardin numérique...
   *   G-RIEL IT Garden
   *
   * Effets :
   *   - Fumée douce
   *   - Typographie élégante
   *   - Ondulation subtile du texte
   *   - Halo lumineux
   *   - Apparition progressive
   *   - Disparition progressive
   *
   * Aucun framework / aucune dépendance externe.
   * ============================================================
   */

  const CONFIG = {
    duration: 5600,
    fadeOut: 1100,

    title: "Bienvenue dans mon jardin numérique...",
    subtitle: "G-RIEL IT Garden",

    particleCount: 95,
    mobileParticleCount: 55,

    enabled: true
  };

  /*
   * ------------------------------------------------------------
   * Accessibilité
   * ------------------------------------------------------------
   */

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!CONFIG.enabled) return;

  /*
   * ------------------------------------------------------------
   * Styles
   * ------------------------------------------------------------
   */

  const style = document.createElement("style");

  style.textContent = `

    /*
     * ==========================================================
     * ÉCRAN D'ACCUEIL
     * ==========================================================
     */

    .gr-welcome-smoke {
      position: fixed;
      inset: 0;

      z-index: 999999;

      width: 100vw;
      height: 100vh;

      overflow: hidden;

      display: flex;
      align-items: center;
      justify-content: center;

      background:
        radial-gradient(
          circle at center,
          rgba(22, 30, 38, 0.96) 0%,
          rgba(5, 8, 12, 0.985) 55%,
          #020305 100%
        );

      opacity: 1;
      visibility: visible;

      transition:
        opacity ${CONFIG.fadeOut}ms ease,
        visibility ${CONFIG.fadeOut}ms ease;

      pointer-events: none;
    }


    .gr-welcome-smoke.gr-hidden {
      opacity: 0;
      visibility: hidden;
    }


    /*
     * ==========================================================
     * CANVAS
     * ==========================================================
     */

    .gr-welcome-smoke canvas {
      position: absolute;
      inset: 0;

      width: 100%;
      height: 100%;

      pointer-events: none;
    }


    /*
     * ==========================================================
     * CONTENU CENTRAL
     * ==========================================================
     */

    .gr-welcome-content {
      position: relative;

      z-index: 2;

      width: min(92vw, 950px);

      padding: 30px;

      text-align: center;

      color: #F2F0E8;

      user-select: none;
      pointer-events: none;

      animation:
        grWelcomeFloat
        6s
        ease-in-out
        infinite;
    }


    /*
     * ==========================================================
     * PHRASE PRINCIPALE
     *
     * "Bienvenue dans mon jardin numérique..."
     * ==========================================================
     */

    .gr-welcome-title {
      margin: 0;

      /*
       * Typographie élégante.
       *
       * Georgia est volontairement placée en premier :
       * elle apporte un aspect plus éditorial, doux et personnel.
       */

      font-family:
        Georgia,
        "Times New Roman",
        Times,
        serif;

      font-size:
        clamp(1.55rem, 4vw, 3rem);

      font-weight: 400;

      font-style: italic;

      line-height: 1.35;

      letter-spacing: 0.035em;

      color: #F2F0E8;

      opacity: 0;

      filter: blur(14px);

      text-shadow:
        0 0 10px rgba(242, 240, 232, 0.18),
        0 0 30px rgba(242, 240, 232, 0.08);

      animation:
        grWelcomeTitle
        1.8s
        0.35s
        forwards
        ease-out;
    }


    /*
     * Chaque lettre devient indépendante
     * pour permettre l'ondulation.
     */

    .gr-welcome-letter {
      display: inline-block;

      will-change:
        transform;

      animation:
        grWelcomeWave
        4.2s
        ease-in-out
        infinite;

      animation-delay:
        calc(var(--i) * -0.085s);
    }


    /*
     * ==========================================================
     * G-RIEL IT GARDEN
     * ==========================================================
     */

    .gr-welcome-subtitle {
      margin: 18px 0 0;

      font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

      font-size:
        clamp(1.15rem, 3vw, 2rem);

      font-weight: 600;

      letter-spacing: 0.18em;

      text-transform: uppercase;

      color: #4DA3FF;

      opacity: 0;

      transform:
        translateY(20px);

      filter: blur(12px);

      text-shadow:
        0 0 8px rgba(77, 163, 255, 0.35),
        0 0 25px rgba(77, 163, 255, 0.20),
        0 0 45px rgba(7, 58, 112, 0.15);

      animation:
        grWelcomeSubtitle
        1.8s
        1.45s
        forwards
        ease-out;
    }


    /*
     * ==========================================================
     * LIGNE LUMINEUSE
     * ==========================================================
     */

    .gr-welcome-line {
      width: min(220px, 45vw);

      height: 1px;

      margin: 24px auto 0;

      background:
        rgba(77, 163, 255, 0.55);

      box-shadow:
        0 0 8px rgba(77, 163, 255, 0.18);

      transform:
        scaleX(0);

      transform-origin:
        center;

      opacity: 0;

      animation:
        grWelcomeLine
        1.4s
        2.1s
        forwards
        ease-out;
    }


    /*
     * ==========================================================
     * APPARITION DU TEXTE
     * ==========================================================
     */

    @keyframes grWelcomeTitle {

      0% {
        opacity: 0;

        transform:
          translateY(25px)
          scale(0.96);

        filter: blur(14px);
      }

      60% {
        opacity: 0.75;
      }

      100% {
        opacity: 1;

        transform:
          translateY(0)
          scale(1);

        filter: blur(0);
      }
    }


    /*
     * ==========================================================
     * ONDULATION DES LETTRES
     * ==========================================================
     *
     * Mouvement volontairement très faible.
     * Le texte doit sembler flotter dans la fumée,
     * pas trembler.
     */

    @keyframes grWelcomeWave {

      0%,
      100% {
        transform:
          translateY(0)
          rotate(0deg);
      }

      20% {
        transform:
          translateY(-2px)
          rotate(-0.35deg);
      }

      40% {
        transform:
          translateY(1px)
          rotate(0.25deg);
      }

      60% {
        transform:
          translateY(-1.5px)
          rotate(-0.2deg);
      }

      80% {
        transform:
          translateY(1px)
          rotate(0.15deg);
      }
    }


    /*
     * ==========================================================
     * SOUS-TITRE
     * ==========================================================
     */

    @keyframes grWelcomeSubtitle {

      0% {
        opacity: 0;

        transform:
          translateY(20px);

        filter: blur(12px);
      }

      100% {
        opacity: 1;

        transform:
          translateY(0);

        filter: blur(0);
      }
    }


    /*
     * ==========================================================
     * LIGNE
     * ==========================================================
     */

    @keyframes grWelcomeLine {

      0% {
        opacity: 0;

        transform:
          scaleX(0);
      }

      100% {
        opacity: 1;

        transform:
          scaleX(1);
      }
    }


    /*
     * ==========================================================
     * LÉGER FLOTTEMENT DU CONTENU
     * ==========================================================
     */

    @keyframes grWelcomeFloat {

      0%,
      100% {
        transform:
          translateY(0);
      }

      50% {
        transform:
          translateY(-5px);
      }
    }


    /*
     * ==========================================================
     * MOBILE
     * ==========================================================
     */

    @media (max-width: 600px) {

      .gr-welcome-content {
        padding: 20px;
      }


      .gr-welcome-title {
        letter-spacing: 0.02em;

        font-size:
          clamp(1.35rem, 6vw, 2rem);

        line-height: 1.4;
      }


      .gr-welcome-subtitle {
        letter-spacing: 0.08em;

        font-size:
          clamp(1rem, 5vw, 1.5rem);
      }
    }


    /*
     * ==========================================================
     * ACCESSIBILITÉ
     * ==========================================================
     */

    @media (prefers-reduced-motion: reduce) {

      .gr-welcome-content {
        animation: none;
      }


      .gr-welcome-title,
      .gr-welcome-subtitle,
      .gr-welcome-line {
        animation: none;

        opacity: 1;

        transform: none;

        filter: none;
      }


      .gr-welcome-letter {
        animation: none;
      }
    }

  `;

  document.head.appendChild(style);


  /*
   * ============================================================
   * STRUCTURE HTML
   * ============================================================
   */

  const overlay =
    document.createElement("div");

  overlay.className =
    "gr-welcome-smoke";

  overlay.setAttribute(
    "aria-hidden",
    "true"
  );


  const canvas =
    document.createElement("canvas");

  const ctx =
    canvas.getContext("2d");


  const content =
    document.createElement("div");

  content.className =
    "gr-welcome-content";


  /*
   * ============================================================
   * TITRE
   *
   * Chaque caractère est placé dans un <span>
   * afin de pouvoir créer l'ondulation.
   * ============================================================
   */

  const title =
    document.createElement("h1");

  title.className =
    "gr-welcome-title";


  [...CONFIG.title].forEach(
    (character, index) => {

      const span =
        document.createElement("span");

      span.className =
        "gr-welcome-letter";

      span.textContent =
        character === " "
          ? "\u00A0"
          : character;

      span.style.setProperty(
        "--i",
        index
      );

      title.appendChild(span);
    }
  );


  /*
   * ============================================================
   * SOUS-TITRE
   * ============================================================
   */

  const subtitle =
    document.createElement("p");

  subtitle.className =
    "gr-welcome-subtitle";

  subtitle.textContent =
    CONFIG.subtitle;


  /*
   * ============================================================
   * LIGNE
   * ============================================================
   */

  const line =
    document.createElement("div");

  line.className =
    "gr-welcome-line";


  /*
   * Assemblage
   */

  content.appendChild(title);

  content.appendChild(subtitle);

  content.appendChild(line);

  overlay.appendChild(canvas);

  overlay.appendChild(content);


  /*
   * ============================================================
   * VARIABLES CANVAS
   * ============================================================
   */

  let width = 0;

  let height = 0;

  let particles = [];

  let animationFrame = null;

  let startTime =
    performance.now();


  /*
   * ============================================================
   * REDIMENSIONNEMENT
   * ============================================================
   */

  const resizeCanvas = () => {

    const ratio =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );


    width =
      window.innerWidth;

    height =
      window.innerHeight;


    canvas.width =
      width * ratio;

    canvas.height =
      height * ratio;


    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;


    ctx.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );
  };


  /*
   * ============================================================
   * PARTICULE DE FUMÉE
   * ============================================================
   */

  class SmokeParticle {

    constructor(initial = false) {

      this.reset(initial);
    }


    reset(initial = false) {

      this.x =
        width * 0.5 +
        (Math.random() - 0.5) *
        width * 0.55;


      this.y =
        initial

          ? height *
            (
              0.45 +
              Math.random() * 0.45
            )

          : height +
            Math.random() * 80;


      this.radius =
        20 +
        Math.random() * 55;


      this.alpha =
        0.015 +
        Math.random() * 0.055;


      this.speed =
        0.15 +
        Math.random() * 0.45;


      this.drift =
        (Math.random() - 0.5) *
        0.5;


      this.phase =
        Math.random() *
        Math.PI *
        2;


      this.phaseSpeed =
        0.005 +
        Math.random() * 0.015;


      this.life =
        0.5 +
        Math.random() * 0.8;
    }


    update() {

      this.phase +=
        this.phaseSpeed;


      this.x +=
        this.drift +
        Math.sin(
          this.phase
        ) * 0.25;


      this.y -=
        this.speed;


      this.radius +=
        0.08;


      this.alpha *=
        0.9985;


      if (
        this.y <
          -this.radius ||
        this.alpha <
          0.005
      ) {

        this.reset(false);
      }
    }


    draw() {

      const gradient =
        ctx.createRadialGradient(
          this.x,
          this.y,
          0,

          this.x,
          this.y,
          this.radius
        );


      gradient.addColorStop(
        0,

        `rgba(
          220,
          230,
          235,
          ${this.alpha}
        )`
      );


      gradient.addColorStop(
        0.35,

        `rgba(
          160,
          175,
          185,
          ${this.alpha * 0.5}
        )`
      );


      gradient.addColorStop(
        1,

        "rgba(80, 90, 100, 0)"
      );


      ctx.fillStyle =
        gradient;


      ctx.beginPath();


      ctx.arc(
        this.x,
        this.y,
        this.radius,
        0,
        Math.PI * 2
      );


      ctx.fill();
    }
  }


  /*
   * ============================================================
   * CRÉATION DES PARTICULES
   * ============================================================
   */

  const createParticles = () => {

    const isMobile =
      width < 700;


    const count =
      isMobile
        ? CONFIG.mobileParticleCount
        : CONFIG.particleCount;


    particles = [];


    for (
      let i = 0;
      i < count;
      i++
    ) {

      particles.push(
        new SmokeParticle(true)
      );
    }
  };


  /*
   * ============================================================
   * FUMÉE AMBIANTE
   * ============================================================
   */

  const drawAmbientSmoke = () => {

    const centerX =
      width / 2;


    const centerY =
      height * 0.55;


    const gradient =
      ctx.createRadialGradient(
        centerX,
        centerY,
        20,

        centerX,
        centerY,
        Math.max(
          width,
          height
        ) * 0.55
      );


    gradient.addColorStop(
      0,
      "rgba(150, 160, 170, 0.035)"
    );


    gradient.addColorStop(
      0.4,
      "rgba(100, 110, 120, 0.018)"
    );


    gradient.addColorStop(
      1,
      "rgba(0, 0, 0, 0)"
    );


    ctx.fillStyle =
      gradient;


    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  };


  /*
   * ============================================================
   * ANIMATION
   * ============================================================
   */

  const animate = (time) => {

    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    drawAmbientSmoke();


    for (
      const particle of particles
    ) {

      particle.update();

      particle.draw();
    }


    const elapsed =
      time - startTime;


    if (
      elapsed >=
      CONFIG.duration
    ) {

      overlay.classList.add(
        "gr-hidden"
      );


      setTimeout(() => {

        cancelAnimationFrame(
          animationFrame
        );


        if (
          overlay.parentNode
        ) {

          overlay.parentNode.removeChild(
            overlay
          );
        }


        if (
          style.parentNode
        ) {

          style.parentNode.removeChild(
            style
          );
        }

      }, CONFIG.fadeOut);


      return;
    }


    animationFrame =
      requestAnimationFrame(
        animate
      );
  };


  /*
   * ============================================================
   * INITIALISATION
   * ============================================================
   */

  const initSmoke = () => {

    resizeCanvas();

    createParticles();


    window.addEventListener(
      "resize",
      resizeCanvas,
      {
        passive: true
      }
    );


    startTime =
      performance.now();


    animationFrame =
      requestAnimationFrame(
        animate
      );
  };


  /*
   * ============================================================
   * MONTAGE
   * ============================================================
   */

  const mount = () => {

    if (!document.body) {
      return;
    }


    document.body.appendChild(
      overlay
    );


    if (reducedMotion) {

      setTimeout(() => {

        overlay.classList.add(
          "gr-hidden"
        );

      }, 2200);


      return;
    }


    initSmoke();
  };


  /*
   * ============================================================
   * LANCEMENT
   * ============================================================
   */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      mount,
      {
        once: true
      }
    );

  } else {

    mount();
  }

})();