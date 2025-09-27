import { checkForUpdate } from './functions/update-check.js';

// --- Au démarrage de Chrome
chrome.runtime.onStartup.addListener(() => {
    console.log("🔄 Vérification des mises à jour au démarrage de Chrome...");
    verifierMAJ();
});

// --- À l'installation / rechargement de l'extension
chrome.runtime.onInstalled.addListener(() => {
    console.log("🔄 Vérification des mises à jour à l’installation/rechargement...");
    verifierMAJ();

    // On planifie une vérification toutes les 4 heures
    chrome.alarms.create("checkUpdates", { periodInMinutes: 240 });
});

// --- Quand l'alarme se déclenche
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkUpdates") {
        console.log("⏰ Vérification programmée des mises à jour...");
        verifierMAJ();
    }
});

// --- Fonction centrale
function verifierMAJ() {
    checkForUpdate().then(result => {
        if (result.updateAvailable) {
            console.log("🔔 Mise à jour détectée :", result.remoteVersion);
            showUpdateNotification(result.remoteVersion, result.repoURL);
        } else {
            console.log("✅ Aucune mise à jour trouvée");
        }
    }).catch(err => {
        console.error(`[${new Date().toLocaleString()}] ⚠️ Erreur lors de la vérification des mises à jour :`, err);
    });
}

// --- Affiche une notification Chrome
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
        toggle_product_rename_tabs: true,
        toggle_catalog_copy_aicm_buttons: true,
        toggle_catalog_color_remplacement: true,
        toggle_catalog_patch_category_filter: true,
        toggle_catalog_shift_selection: true,
        catalog_color_remplacement_default: '#0052a3',
        catalog_color_highlight_default: '#fff7c6',
        select_catalog_display_combinations_default: "resume",
        toggle_product_subtitle_display: true,
        toggle_product_preview_buttons: true,
        toggle_product_focus_auto: true,
        toggle_product_preset_specs: true,
        toggle_product_auto_occasion: true,
        toggle_product_smart_category: true,
        toggle_product_insertSeoTitleButton: true,
        toggle_product_specificPrices_color: true,
        toggle_product_EncartOffrePageProduit_presets: true,
        toggle_product_heureFin: true,
        toggle_product_heureDebut: true,
        toggle_product_datePromoHistorique: true,
        toggle_orders_trackingPatch: true,
        toggle_orders_view_copyCommandeNumber: true,
        toggle_orders_view_copyAicm: true,
        toggle_orders_carts_copyAicm: true,
        toggle_client_adminEdit_buttons: true,
        color_adminEditBtn_miniature_default: '#007bff',
        select_client_adminEditBtn_miniature_default: "center",
        toggle_colissimo_confirm_annuler: true,
        toggle_contextMenu_copy_text: true,
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
    const whitelistContextMenu = [
        "*://concept-store-photo.dmu.sarl/*",
        "*://conceptstorephoto.fr/*",
        "*://www.conceptstorephoto.fr/*",
        "*://docs.google.com/*",
    ];
    chrome.contextMenus.removeAll(() => {

        chrome.storage.sync.get("toggle_contextMenu_copy_text", (data) => {
            if (!data.toggle_contextMenu_copy_text) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "copier-ref", // identifiant unique
                title: "📋 Copier le texte",
                contexts: ["selection", "link"], // selon ce que tu veux viser
                // documentUrlPatterns: whitelistContextMenu // uniquement sur ton site
            });
        });

        chrome.storage.sync.get("toggle_contextMenu_search_miss_num", (data) => {
            if (!data.toggle_contextMenu_search_miss_num) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "recherche-missNumerique", // identifiant unique
                title: "🔎 Rechercher sur Miss Numérique",
                contexts: ["selection", "link"],
                documentUrlPatterns: whitelistContextMenu
            });
        });

        chrome.storage.sync.get("toggle_contextMenu_search_idealo", (data) => {
            if (!data.toggle_contextMenu_search_idealo) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "recherche-idealo", // identifiant unique
                title: "🔎 Rechercher sur Idealo",
                contexts: ["selection", "link"],
                documentUrlPatterns: whitelistContextMenu
            });
        });

        chrome.storage.sync.get("toggle_contextMenu_search_panajou", (data) => {
            if (!data.toggle_contextMenu_search_panajou) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "recherche-panajou", // identifiant unique
                title: "🔎 Rechercher sur Panajou",
                contexts: ["selection", "link"],
                documentUrlPatterns: whitelistContextMenu
            });
        });

        chrome.storage.sync.get("toggle_contextMenu_search_ipln", (data) => {
            if (!data.toggle_contextMenu_search_ipln) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "recherche-ipln", // identifiant unique
                title: "🔎 Rechercher sur IPLN",
                contexts: ["selection", "link"],
                documentUrlPatterns: whitelistContextMenu
            });
        });

        chrome.storage.sync.get("toggle_contextMenu_search_fnac", (data) => {
            if (!data.toggle_contextMenu_search_fnac) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "recherche-fnac", // identifiant unique
                title: "🔎 Rechercher sur Fnac",
                contexts: ["selection", "link"],
                documentUrlPatterns: whitelistContextMenu
            });
        });

        chrome.storage.sync.get("toggle_contextMenu_search_csp", (data) => {
            if (!data.toggle_contextMenu_search_csp) return; // Ne rien faire si désactivé

            chrome.contextMenus.create({
                id: "recherche-csp", // identifiant unique
                title: "🔎 Rechercher sur Concept Store Photo",
                contexts: ["selection", "link"],
                documentUrlPatterns: whitelistContextMenu
            });
        });

    });
}

// écoute tous les messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("📩 Message reçu dans background :", msg);

    // mise à jour menu contextuel
    if (msg.type === "updateContextMenu") {
        updateContextMenu();
    }

    // gestion des broadcasts (Prestashop <-> Fnac)
    if (msg.type === "broadcast") {
        chrome.tabs.query({}, (tabs) => {
            for (const tab of tabs) {
                if (tab.id === sender.tab?.id || !tab.url) continue;

                const isFromFnac = sender.tab?.url?.includes("fnac.com");
                const isFromPresta = sender.tab?.url?.includes("conceptstorephoto");

                if (isFromFnac && tab.url.includes("conceptstorephoto")) {
                    chrome.tabs.sendMessage(tab.id, msg).catch(() => { });
                }
                if (isFromPresta && tab.url.includes("fnac.com")) {
                    chrome.tabs.sendMessage(tab.id, msg).catch(() => { });
                }
            }
        });
    }

    sendResponse({ status: "ok" }); // réponse obligatoire
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.url.includes("fnac.com")) {
        console.log("🌍 Fnac change de page → reset état");

        chrome.tabs.query({}, (tabs) => {
            for (const tab of tabs) {
                const url = tab.url || "";
                if (url.includes("conceptstorephoto.fr")) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: "broadcast",
                        action: "page_fnac_ean_ready",
                        ready: false
                    });
                    chrome.tabs.sendMessage(tab.id, {
                        type: "broadcast",
                        action: "page_fnac_fiche_ready",
                        ready: false
                    });
                }
            }
        });
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
        case "recherche-fnac":
            injecterRecherche(tab.id, "https://www.fnac.com/SearchResult/ResultList.aspx?Search=");
            break;
        case "recherche-csp":
            injecterRecherche(tab.id, "https://www.conceptstorephoto.fr/recherche?controller=search&s=");
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
    if (command === "PrestaShopBackCatalog") {
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
    else if (command === "PrestaShopPreviewCatalog") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => {
                        // Remplace ici par le sélecteur du bouton
                        const bouton = document.querySelector('#product_footer_actions_preview');
                        if (bouton) bouton.click();
                    }
                });
            }
        });
    }
});
