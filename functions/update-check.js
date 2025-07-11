const GITHUB_MANIFEST_URL = "https://raw.githubusercontent.com/ConceptStorePhoto/chrome-extensions-CSP-tools/refs/heads/main/manifest.json";
const GITHUB_REPO_URL = "https://github.com/ConceptStorePhoto/chrome-extensions-CSP-tools";

export async function checkForUpdate() {
    try {
        console.log("🔎 Vérification de mise à jour en cours...");
        const res = await fetch(GITHUB_MANIFEST_URL);
        console.log("HTTP status fetch manifest:", res.status);
        if (!res.ok) {
            console.error(`❌ Erreur HTTP lors du fetch du manifest: ${res.status}`);
            throw new Error(`Erreur HTTP ${res.status}`);
        }
        const remoteManifest = await res.json();
        const remoteVersion = remoteManifest.version;
        const localVersion = chrome.runtime.getManifest().version;

        console.log(`📦 Version locale: ${localVersion}, Version distante: ${remoteVersion}`);

        if (isNewerVersion(remoteVersion, localVersion)) {
            console.log("🚀 Mise à jour disponible !");
            return { updateAvailable: true, remoteVersion, repoURL: GITHUB_REPO_URL, localVersion };
        } else {
            console.log("✅ Extension à jour.");
            return { updateAvailable: false, localVersion };
        }
    } catch (err) {
        console.error("❌ Erreur lors de la vérification de mise à jour :", err);
        return { updateAvailable: false };
    }
}

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
