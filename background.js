import { checkForUpdate } from './update-check.js';
// Vérification des mises à jour à l'initialisation de l'extension
console.log("🔄 Vérification des mises à jour au démarrage de l'extension...");
checkForUpdate().then(result => {
    if (result.updateAvailable) {
        console.log("🔔 Mise à jour détectée :", result.remoteVersion);
        showUpdateNotification(result.remoteVersion, result.repoURL);
    }
});

// Affiche une notification native Chrome
function showUpdateNotification(version, url) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "logo.png",
        title: "CSP tools - Nouvelle version disponible",
        message: `Version ${version} disponible. Cliquez pour voir.`,
        priority: 2
    }, (notificationId) => {
        chrome.notifications.onClicked.addListener((notifId) => {
            if (notifId === notificationId) {
                chrome.tabs.create({ url });
            }
        });
    });
}

/////////////////////////////////////

// Création du menu contextuel
function updateContextMenu(enabled) {
    chrome.contextMenus.removeAll(() => {
        if (enabled) {
            chrome.contextMenus.create({
                id: "copier-ref", // identifiant unique
                title: "Copier le texte",
                contexts: ["selection", "link"], // selon ce que tu veux viser
                documentUrlPatterns: [
                    "*://concept-store-photo.dmu.sarl/*"
                ] // uniquement sur ton site
            });
        }
    });
}

// Quand l'extension démarre : lire l'état
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get("toggle_ContextMenu", (data) => {
        updateContextMenu(data.toggle_ContextMenu ?? true);
    });
});

// Réagir aux messages depuis la popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggle_ContextMenu") {
        updateContextMenu(message.enabled);
    }
});

// Action quand l’utilisateur clique sur l’entrée du menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "copier-ref") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: copierReferenceDepuisPage
        });
    }
});

// Cette fonction sera injectée dans la page
function copierReferenceDepuisPage() {
    //copie le texte sélectionné ou le texte de l'élément cliqué
    const selection = window.getSelection().toString().trim();
    const element = document.activeElement;

    if (selection) {
        navigator.clipboard.writeText(selection).then(() => {
            // alert("Texte copié : " + selection);
        });
    } else if (element) {
        const texte = element.innerText;
        navigator.clipboard.writeText(texte).then(() => {
            // alert("Texte copié : " + texte);
        });
    } else {
        alert("Aucun texte trouvé !");
    }
}
