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

// Quand l'extension démarre
chrome.runtime.onInstalled.addListener(() => {
    console.log("🔄 Extension installée");

    // définition des réglages par défaut si non déjà définis
    chrome.storage.sync.get(["toggle_copy_aicm_buttons", "toggle_copy_text", "toggle_preview_buttons", "toggle_adminEdit_buttons"], (data) => {
        if (data.toggle_copy_aicm_buttons === undefined) {
            chrome.storage.sync.set({ toggle_copy_aicm_buttons: true });
        }
        if (data.toggle_copy_text === undefined) {
            chrome.storage.sync.set({ toggle_copy_text: true });
        }
        if (data.toggle_preview_buttons === undefined) {
            chrome.storage.sync.set({ toggle_preview_buttons: true });
        }
        if (data.toggle_adminEdit_buttons === undefined) {
            chrome.storage.sync.set({ toggle_adminEdit_buttons: true });
        }
    });

    updateContextMenu(); // Met à jour le menu contextuel au démarrage

});

function updateContextMenu() {
    // Création du menu contextuel
    console.log("🔄 Création du menu contextuel");
    chrome.contextMenus.removeAll(() => {

        chrome.storage.sync.get("toggle_copy_text", (data) => {
            if (!data.toggle_copy_text) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "copier-ref", // identifiant unique
                title: "Copier le texte",
                contexts: ["selection", "link"], // selon ce que tu veux viser
                documentUrlPatterns: [
                    "*://concept-store-photo.dmu.sarl/*",
                    "*://conceptstorephoto.fr/*"
                ] // uniquement sur ton site
            });
        });

        chrome.storage.sync.get("toggle_search_miss_num", (data) => {
            if (!data.toggle_search_miss_num) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "recherche-missNumerique", // identifiant unique
                title: "Rechercher sur Miss Numérique",
                contexts: ["selection", "link"],
                documentUrlPatterns: [
                    "*://concept-store-photo.dmu.sarl/*"
                ]
            });
        });

    });
}

// Réagir aux messages depuis la popup
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "updateContextMenu") {
        updateContextMenu();
    }
});

// Action quand l’utilisateur clique sur l’entrée du menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "copier-ref":
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: copierReferenceDepuisPage
            });
            break;
        case "recherche-missNumerique":
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: rechercherSurMissNumerique
            });
            break;
    }
});

// Fonction pour copier le texte sélectionné ou le texte de l'élément cliqué
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


function rechercherSurMissNumerique() {
    const selection = window.getSelection().toString().trim();
    const element = document.activeElement;

    if (selection) {
        const url = `https://www.missnumerique.com/#75e9/embedded/m=and&q=${encodeURIComponent(selection)}`;
        window.open(url, '_blank');
    }
    else if (element) {
        const texte = element.innerText.trim();
        if (texte) {
            const url = `https://www.missnumerique.com/#75e9/embedded/m=and&q=${encodeURIComponent(texte)}`;
            window.open(url, '_blank');
        } else {
            alert("Aucun texte trouvé dans l'élément cliqué.");
        }
    } else {
        alert("Veuillez sélectionner un texte à rechercher.");
    }
}


//// Gestion des raccourcis clavier
chrome.commands.onCommand.addListener((command) => {
    if (command === "backCatalog") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => {
                        // Remplace ici par le sélecteur du bouton
                        const bouton = document.querySelector('#product_footer_actions_catalog');
                        if (bouton) bouton.click();
                    }
                });
            }
        });
    }
});
