/* G-RIEL IT Garden — progressive PWA registration */
(() => {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    const manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) return;

    try {
      // The manifest always resolves to the project root, even from nested labs.
      const manifestUrl = new URL(manifest.href);
      const swUrl = new URL("./sw.js", manifestUrl);
      const scope = new URL("./", manifestUrl);

      await navigator.serviceWorker.register(swUrl.pathname + swUrl.search, {
        scope: scope.pathname
      });
    } catch (error) {
      console.warn("G-RIEL IT Garden — PWA non activée :", error);
    }
  });
})();
