const GITHUB_REPO = "ConceptStorePhoto/chrome-extensions-CSP-tools";

// Sans token : URLs publiques (dépôt public). Avec un fichier update-token.txt : API GitHub (dépôt privé).
const PUBLIC_MANIFEST_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/main/manifest.json`;
const PUBLIC_ZIP_URL = `https://github.com/${GITHUB_REPO}/archive/refs/heads/main.zip`;
const API_MANIFEST_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/manifest.json?ref=main`;
const API_ZIP_URL = `https://api.github.com/repos/${GITHUB_REPO}/zipball/main`;

const CACHE_KEY = "update_check_cache";

// Lit le token de mise à jour (update-token.txt à la racine de l'extension), null si absent
async function getUpdateToken() {
    try {
        const res = await fetch(chrome.runtime.getURL("update-token.txt"));
        if (!res.ok) return null;
        return (await res.text()).trim() || null;
    } catch {
        return null;
    }
}

async function fetchRemoteVersion() {
    const token = await getUpdateToken();
    const res = token
        ? await fetch(API_MANIFEST_URL, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/vnd.github.raw+json"
            },
            cache: "no-store"
        })
        : await fetch(PUBLIC_MANIFEST_URL, { cache: "no-store" });
    console.log(`HTTP status fetch manifest (${token ? "API + token" : "public"}):`, res.status);
    if (!res.ok) {
        console.error(`❌ Erreur HTTP lors du fetch du manifest: ${res.status}`);
        throw new Error(`Erreur HTTP ${res.status}`);
    }
    const remoteManifest = await res.json();
    return remoteManifest.version;
}

// Version des fichiers présents sur le disque. Elle peut être plus récente que la version chargée
// par Chrome (chrome.runtime.getManifest) après une mise à jour automatique, tant que l'extension
// n'a pas été rechargée.
export async function getInstalledVersion() {
    try {
        const res = await fetch(chrome.runtime.getURL("manifest.json"), { cache: "no-store" });
        return (await res.json()).version;
    } catch {
        return chrome.runtime.getManifest().version;
    }
}

// maxAgeMinutes > 0 : réutilise la dernière version distante connue si elle a moins de maxAgeMinutes
export async function checkForUpdate({ maxAgeMinutes = 0 } = {}) {
    const localVersion = await getInstalledVersion();
    try {
        let remoteVersion = null;
        if (maxAgeMinutes > 0) {
            const { [CACHE_KEY]: cache } = await chrome.storage.local.get(CACHE_KEY);
            if (cache && Date.now() - cache.checkedAt < maxAgeMinutes * 60 * 1000) {
                remoteVersion = cache.remoteVersion;
                console.log("📦 Version distante lue depuis le cache :", remoteVersion);
            }
        }
        if (!remoteVersion) {
            console.log("🔎 Vérification de mise à jour en cours...");
            remoteVersion = await fetchRemoteVersion();
            await chrome.storage.local.set({ [CACHE_KEY]: { remoteVersion, checkedAt: Date.now() } });
        }

        console.log(`📦 Version locale: ${localVersion}, Version distante: ${remoteVersion}`);

        if (isNewerVersion(remoteVersion, localVersion)) {
            console.log("🚀 Mise à jour disponible !");
            return { updateAvailable: true, remoteVersion, localVersion };
        } else {
            console.log("✅ Extension à jour.");
            return { updateAvailable: false, remoteVersion, localVersion };
        }
    } catch (err) {
        console.error("❌ Erreur lors de la vérification de mise à jour :", err);
        return { updateAvailable: false, localVersion, error: true };
    }
}

// Télécharge le ZIP de la dernière version dans le dossier Téléchargements
export async function downloadLatestZip(version) {
    const token = await getUpdateToken();
    const options = {
        url: token ? API_ZIP_URL : PUBLIC_ZIP_URL,
        filename: `CSP-tools-v${version || "derniere"}.zip`,
        conflictAction: "uniquify"
    };
    if (token) options.headers = [{ name: "Authorization", value: `Bearer ${token}` }];
    return chrome.downloads.download(options);
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
