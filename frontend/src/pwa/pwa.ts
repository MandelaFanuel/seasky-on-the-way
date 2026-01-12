// ========================= src/pwa/pwa.ts =========================
let deferredPrompt: any = null;
let canInstall = false;

function emitInstallable() {
  try {
    window.dispatchEvent(new CustomEvent("seasky:pwa-installable", { detail: { canInstall } }));
  } catch {
    // ignore
  }
}

// ✅ Install prompt (Chrome/Edge/Android)
window.addEventListener("beforeinstallprompt", (e: any) => {
  e.preventDefault();
  deferredPrompt = e;
  canInstall = true;
  emitInstallable();
});

// (Optionnel) si l'app est installée
window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  canInstall = false;
  emitInstallable();
});

// ✅ Service Worker registration + update auto-refresh (sans virtual module)
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      // Avec vite-plugin-pwa (GenerateSW), le SW est souvent /sw.js
      // Si ton plugin génère un autre nom, adapte ici.
      const reg = await navigator.serviceWorker.register("/sw.js");

      // ✅ Update flow: quand une nouvelle version est installée => reload
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          // "installed" + un controller existant => update dispo
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // Ici tu pourrais afficher un toast,
            // mais pour rester simple: on recharge pour appliquer la nouvelle version
            window.location.reload();
          }
        });
      });
    } catch (err) {
      // Si /sw.js n'existe pas (ex: dev), on ignore sans casser l'app
      // eslint-disable-next-line no-console
      console.warn("[PWA] SW registration skipped:", err);
    }
  });
}

registerServiceWorker();

export function canInstallApp() {
  return canInstall;
}

export async function installApp() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  canInstall = false;
  emitInstallable();
  return true;
}
