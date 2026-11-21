console.log('This is a popup!');

import { gestionToggle } from './functions/gestion-toggle.js';
import { gestionColorInput } from './functions/gestion-color-input.js';
import { gestionSelectInput } from './functions/gestion-select-input.js';

document.addEventListener("DOMContentLoaded", () => {

    // Vérification de l'URL de l'onglet actif et affichage de contenu spécifique
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;

        const activeTab = tabs[0];
        const rawUrl = activeTab.url;

        try {
            const url = new URL(rawUrl);
            const hostname = url.hostname;
            console.log(url)

            if ((hostname.includes("concept-store-photo.dmu.sarl") || hostname.includes("conceptstorephoto.fr"))) {
                console.log("✅ Concept Store Photo detected", hostname);
                document.getElementById("toolsCSP").classList.remove('hide');
                document.getElementById("refreshContainer").classList.remove('hide');
                //// Cache toutes les sections au départ
                document.querySelectorAll('#toolsCSP .conteneur:not([data-type="global"])').forEach((elem) => {
                    elem.classList.add('hide');
                });
                //// Affiche les sections en fonction du type de page
                // if (url.pathname.includes('catalog') && url.pathname.split("/")[url.pathname.split("/").length - 1] == "")
                //     document.querySelectorAll('[data-type="admin-catalog"]').forEach((elem) => {
                //         elem.classList.remove('hide');
                //     });

                // else if (url.pathname.includes('catalog') && url.pathname.split("/")[url.pathname.split("/").length - 1] == "edit")
                //     document.querySelectorAll('[data-type="admin-catalog-product"]').forEach((elem) => {
                //         elem.classList.remove('hide');
                //     })

                // else if (url.search.includes('AdminDmuBackToNew'))
                //     document.querySelector('[data-type="admin-catalog-dmuNew"]').classList.remove('hide');

                // else if (url.pathname.includes('orders'))
                //     document.querySelectorAll('[data-type^="admin-orders"]').forEach((elem) => {
                //         elem.classList.remove('hide');
                //     });

                if (url.pathname.includes('logcncin'))
                    document.querySelectorAll('#toolsCSP [data-type^="admin"]').forEach((elem) => {
                        elem.classList.remove('hide');
                    });

                else if (!url.pathname.includes('logcncin'))
                    document.querySelectorAll('#toolsCSP [data-type="client"]').forEach((elem) => {
                        elem.classList.remove('hide');
                    });

                // else
                //     document.querySelectorAll('#toolsCSP .conteneur').forEach((elem) => {
                //         elem.classList.remove('hide');
                //     });

            } else if (hostname.includes("leboncoin.fr")) {
                console.log("✅ LeBonCoin detected", hostname);
                document.getElementById("LBCtools").classList.remove('hide');
                document.getElementById("refreshContainer").classList.remove('hide');
            } else if (hostname.includes("applications.colissimo.entreprise.laposte.fr")) {
                console.log("✅ Colissimo detected", hostname);
                document.getElementById("COLISSIMOtools").classList.remove('hide');
                document.getElementById("refreshContainer").classList.remove('hide');
            } else if (hostname.includes("fnac.com")) {
                console.log("✅ Fnac detected", hostname);
                document.getElementById("fnacTools").classList.remove('hide');
                document.getElementById("refreshContainer").classList.remove('hide');
            } else {
                console.log("ℹ️ Site non reconnu :", hostname);
                document.getElementById("infoMessage").textContent = `Site non reconnu : ${hostname}`;
                document.getElementById("infoMessage").classList.remove('hide');
            }
        } catch (err) {
            console.error("❌ URL invalide ou inaccessible :", rawUrl, err);
            document.getElementById("infoMessage").textContent = "Impossible de détecter le site actif.";
            document.getElementById("infoMessage").classList.remove('hide');
        }
    });

    gestionToggle();
    gestionColorInput();
    gestionSelectInput();

    // Bouton "Recharger la page"
    const refreshBtn = document.getElementById("refresh");
    refreshBtn.addEventListener("click", () => {
        // Trouver l'onglet actif et le recharger
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    });

    // Observer pour rendre le bouton "Recharger" fixe en bas de la popup
    const refreshContainer = document.getElementById("refreshContainer");
    const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) {
            refreshContainer.classList.add('fixed');
        } else {
            refreshContainer.classList.remove('fixed');
        }
    });
    observer.observe(document.getElementById("sentinel_refresh"));

});


// Vérification des mises à jour
import { checkForUpdate, downloadLatestZip } from './functions/update-check.js';

document.addEventListener("DOMContentLoaded", async () => {
    const updateMsg = document.getElementById("update-message");

    const updateInfo = await checkForUpdate({ maxAgeMinutes: 30 });

    if (updateInfo.localVersion !== chrome.runtime.getManifest().version) {
        // Fichiers déjà mis à jour sur le disque (mise à jour automatique) : il reste à recharger l'extension
        const lienActiver = document.createElement("a");
        lienActiver.href = "#";
        lienActiver.textContent = "Activer maintenant";
        lienActiver.addEventListener("click", (event) => {
            event.preventDefault();
            chrome.runtime.reload();
        });
        updateMsg.replaceChildren(
            `🔄 Version ${updateInfo.localVersion} installée : `, lienActiver,
            " (puis rechargez les pages du back-office déjà ouvertes)"
        );
        updateMsg.classList.remove('hide');
    } else if (updateInfo.updateAvailable) {
        const titre = document.createElement("strong");
        titre.textContent = "Mise à jour disponible";

        const lienTelecharger = document.createElement("a");
        lienTelecharger.href = "#";
        lienTelecharger.textContent = "Télécharger le ZIP";
        lienTelecharger.addEventListener("click", (event) => {
            event.preventDefault();
            downloadLatestZip(updateInfo.remoteVersion)
                .then(() => (lienTelecharger.textContent = "✅ Téléchargement lancé"))
                .catch(err => {
                    console.error("❌ Téléchargement de la mise à jour impossible :", err);
                    lienTelecharger.textContent = "❌ Échec du téléchargement";
                });
        });

        updateMsg.replaceChildren(
            "🚀 ", titre, ` (v${updateInfo.localVersion} ➡️ v${updateInfo.remoteVersion}) `,
            lienTelecharger, " ou lancer UPDATE.bat"
        );
        updateMsg.classList.remove('hide');
    } else if (updateInfo.error) {
        updateMsg.textContent = `⚠️ Vérification des mises à jour impossible - Version : ${updateInfo.localVersion}`;
        updateMsg.classList.remove('hide');
    } else {
        updateMsg.textContent = `✅ Extension à jour - Version : ${updateInfo.localVersion}`;
        updateMsg.classList.remove('hide');
    }
});
