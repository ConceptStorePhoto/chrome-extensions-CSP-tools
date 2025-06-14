console.log('This is a popup!');

document.addEventListener("DOMContentLoaded", () => {

    // Vérification de l'URL de l'onglet actif et affichage de contenu spécifique
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;

        const activeTab = tabs[0];
        const rawUrl = activeTab.url;

        try {
            const url = new URL(rawUrl);
            const hostname = url.hostname;

            if (hostname.includes("concept-store-photo.dmu.sarl")) {
                console.log("✅ Concept Store Photo detected", hostname);
                document.getElementById("toolsCSP").style.display = "flex";
            } else {
                console.log("ℹ️ Site non reconnu :", hostname);
                document.getElementById("infoMessage").textContent = `Site non reconnu : ${hostname}`;
                document.getElementById("toolsCSP").style.display = "none";
                document.getElementById("infoMessage").style.display = "block";
            }
        } catch (err) {
            console.error("❌ URL invalide ou inaccessible :", rawUrl, err);
            document.getElementById("infoMessage").textContent = "Impossible de détecter le site actif.";
            document.getElementById("toolsCSP").style.display = "none";
            document.getElementById("infoMessage").style.display = "block";
        }
    });


    // fonction pour gérer les toogles
    const toggleButtons = document.querySelectorAll('.toggle-button');
    toggleButtons.forEach(button => {
        let id = button.id;

        // Charger l'état actuel pour chaque bouton
        chrome.storage.sync.get(id, (data) => {
            button.checked = !!data[id];
        });

        // Mise à jour de l'état 
        button.addEventListener('change', () => {
            chrome.storage.sync.set({ [button.id]: button.checked },() => {
                chrome.runtime.sendMessage({ action: button.id, enabled: button.checked });
            });
        });

    });

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


});


// Vérification des mises à jour
import { checkForUpdate } from './update-check.js';

document.addEventListener("DOMContentLoaded", async () => {
    const updateMsg = document.getElementById("update-message");

    const updateInfo = await checkForUpdate();

    if (updateInfo.updateAvailable) {
        updateMsg.innerHTML = `
            🚀 <strong>Mise à jour disponible</strong> (v${updateInfo.remoteVersion})
            <a href="${updateInfo.repoURL}" target="_blank" rel="noopener">Télécharger</a>
        `;
        updateMsg.style.display = "block";
    } else {
        updateMsg.textContent = `✅ Extension à jour - Version : ${updateInfo.localVersion}`;
        updateMsg.style.display = "block";
    }
});
