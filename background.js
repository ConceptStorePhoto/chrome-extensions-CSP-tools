import { checkForUpdate } from './functions/update-check.js';
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
    const defaultSettings = {
        toggle_copy_aicm_buttons: true,
        toggle_contextMenu_copy_text: true,
        toggle_product_preview_buttons: true,
        toggle_adminEdit_buttons: true,
        toggle_heureFin: true,
        toggle_colissimo_confirm_annuler: true,
        catalog_color_remplacement_default: '#0052a3',
        catalog_color_highlight_default: '#fff7c6'
    };
    chrome.storage.sync.get(Object.keys(defaultSettings), (data) => {
        const settingsToSet = {};
        for (const [key, defaultValue] of Object.entries(defaultSettings)) {
            if (data[key] === undefined) {
                settingsToSet[key] = defaultValue;
            }
        }
        if (Object.keys(settingsToSet).length > 0) {
            chrome.storage.sync.set(settingsToSet);
        }
    });

    updateContextMenu(); // Met à jour le menu contextuel au démarrage

});

function updateContextMenu() {
    // Création du menu contextuel
    console.log("🔄 Création du menu contextuel");
    chrome.contextMenus.removeAll(() => {

        chrome.storage.sync.get("toggle_contextMenu_copy_text", (data) => {
            if (!data.toggle_contextMenu_copy_text) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "copier-ref", // identifiant unique
                title: "📋 Copier le texte",
                contexts: ["selection", "link"], // selon ce que tu veux viser
                documentUrlPatterns: [
                    "*://concept-store-photo.dmu.sarl/*",
                    "*://conceptstorephoto.fr/*",
                    "*://www.conceptstorephoto.fr/*"
                ] // uniquement sur ton site
            });
        });

        chrome.storage.sync.get("toggle_contextMenu_search_miss_num", (data) => {
            if (!data.toggle_contextMenu_search_miss_num) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "recherche-missNumerique", // identifiant unique
                title: "🔎 Rechercher sur Miss Numérique",
                contexts: ["selection", "link"],
                documentUrlPatterns: [
                    "*://concept-store-photo.dmu.sarl/*",
                    "*://conceptstorephoto.fr/*",
                    "*://www.conceptstorephoto.fr/*"
                ]
            });
        });

        chrome.storage.sync.get("toggle_contextMenu_search_idealo", (data) => {
            if (!data.toggle_contextMenu_search_idealo) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "recherche-idealo", // identifiant unique
                title: "🔎 Rechercher sur Idealo",
                contexts: ["selection", "link"],
                documentUrlPatterns: [
                    "*://concept-store-photo.dmu.sarl/*",
                    "*://conceptstorephoto.fr/*",
                    "*://www.conceptstorephoto.fr/*"
                ]
            });
        });

        chrome.storage.sync.get("toggle_contextMenu_search_panajou", (data) => {
            if (!data.toggle_contextMenu_search_panajou) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "recherche-panajou", // identifiant unique
                title: "🔎 Rechercher sur Panajou",
                contexts: ["selection", "link"],
                documentUrlPatterns: [
                    "*://concept-store-photo.dmu.sarl/*",
                    "*://conceptstorephoto.fr/*",
                    "*://www.conceptstorephoto.fr/*"
                ]
            });
        });

        chrome.storage.sync.get("toggle_contextMenu_search_ipln", (data) => {
            if (!data.toggle_contextMenu_search_ipln) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "recherche-ipln", // identifiant unique
                title: "🔎 Rechercher sur IPLN",
                contexts: ["selection", "link"],
                documentUrlPatterns: [
                    "*://concept-store-photo.dmu.sarl/*",
                    "*://conceptstorephoto.fr/*",
                    "*://www.conceptstorephoto.fr/*"
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
            injecterRecherche(tab.id, "https://www.missnumerique.com/#75e9/embedded/m=and&q=");
            break;
        case "recherche-idealo":
            injecterRecherche(tab.id, "https://www.idealo.fr/prechcat.html?q=");
            break;
        case "recherche-panajou":
            injecterRecherche(tab.id, "https://www.panajou.fr/resultats-recherche-photos-videos?search_query=");
            break;
        case "recherche-ipln":
            injecterRecherche(tab.id, "https://ipln.fr/recherche?controller=search&s=");
            break;
    }
});

// Fonction pour copier le texte sélectionné ou le texte de l'élément cliqué
function copierReferenceDepuisPage() {
    //copie le texte sélectionné ou le texte de l'élément cliqué
    const selection = window.getSelection().toString().trim();
    const active = document.activeElement;

    if (selection) {
        navigator.clipboard.writeText(selection);
    } else if (active?.tagName === "A" && active.href.includes("/logcncin/index.php/sell/catalog/products-v2/")) {
        const aText = active.textContent.trim();
        const span = active.closest("td")?.querySelector("span");
        const spanText = span?.textContent.trim() ?? "";
        const texteCombine = `${aText} ${spanText}`.trim();
        navigator.clipboard.writeText(texteCombine);
    } else if (active) {
        const texte = active.textContent?.trim() ?? "";
        if (texte) {
            navigator.clipboard.writeText(texte);
        } else {
            alert("Aucun texte trouvé à copier.");
        }
    } else {
        alert("Aucun texte trouvé !");
    }
}

function injecterRecherche(tabId, baseURL) {
    chrome.scripting.executeScript({
        target: { tabId },
        func: (baseURL) => {
            const selection = window.getSelection().toString().trim();
            const element = document.activeElement;
            let texte = selection || (element?.innerText?.trim() ?? "");

            if (element?.tagName === "A" && element.href.includes("/logcncin/index.php/sell/catalog/products-v2/")) {
                const aText = element.textContent.trim();
                const span = element.closest("td")?.querySelector("span");
                const spanText = span?.textContent.trim() ?? "";
                texte = `${aText} ${spanText}`.trim();
            }

            if (texte) {
                const url = baseURL + encodeURIComponent(texte);
                window.open(url, '_blank');
            } else {
                alert("Aucun texte sélectionné ou trouvé dans l'élément actif.");
            }
        },
        args: [baseURL]
    });
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
