const GITHUB_MANIFEST_URL = "https://raw.githubusercontent.com/ConceptStorePhoto/chrome-extensions-CSP-tools/refs/heads/main/manifest.json";

// Vérifie la version distante vs. locale
async function checkForUpdate() {
    try {
        const res = await fetch(GITHUB_MANIFEST_URL);
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

        const remoteManifest = await res.json();
        const remoteVersion = remoteManifest.version;

        // Version locale depuis le manifest embarqué
        const localVersion = chrome.runtime.getManifest().version;

        console.log(`🔍 Version locale : ${localVersion} | distante : ${remoteVersion}`);

        if (isNewerVersion(remoteVersion, localVersion)) {
            console.log("🚀 Nouvelle version disponible :", remoteVersion);
            notifyUpdateAvailable(remoteVersion);
        } else {
            console.log("✅ Extension à jour");
        }
    } catch (err) {
        console.error("❌ Erreur de vérification de mise à jour :", err);
    }
}

// Compare deux versions "x.y.z"
function isNewerVersion(remote, local) {
    const r = remote.split('.').map(Number);
    const l = local.split('.').map(Number);
    for (let i = 0; i < Math.max(r.length, l.length); i++) {
        const ri = r[i] || 0;
        const li = l[i] || 0;
        if (ri > li) return true;
        if (ri < li) return false;
    }
    return false;
}

// Notification si mise à jour dispo
function notifyUpdateAvailable(version) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'logo.png',
        title: '🔄 Mise à jour disponible',
        message: `Une nouvelle version (${version}) est disponible sur GitHub.`,
        priority: 2
    });
}

// Appelle la fonction au démarrage du service worker
checkForUpdate();
