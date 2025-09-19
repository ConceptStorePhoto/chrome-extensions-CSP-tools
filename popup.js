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
                // //// Cache toutes les sections au départ
                // document.querySelectorAll('#toolsCSP .conteneur:not([data-type="global"])').forEach((elem) => {
                //     elem.classList.add('hide');
                // });
                // //// Affiche les sections en fonction du type de page
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
import { checkForUpdate } from './functions/update-check.js';

document.addEventListener("DOMContentLoaded", async () => {
    const updateMsg = document.getElementById("update-message");

    const updateInfo = await checkForUpdate();

    if (updateInfo.updateAvailable) {
        updateMsg.innerHTML = `
            🚀 <strong>Mise à jour disponible</strong> (v${updateInfo.localVersion} ➡️ v${updateInfo.remoteVersion})
            <a href="${updateInfo.repoURL}" target="_blank" rel="noopener">Télécharger</a>
        `;
        updateMsg.classList.remove('hide');
    } else {
        updateMsg.textContent = `✅ Extension à jour - Version : ${updateInfo.localVersion}`;
        updateMsg.classList.remove('hide');
    }
});
