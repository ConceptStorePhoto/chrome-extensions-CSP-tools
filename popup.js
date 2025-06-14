console.log('This is a popup!');

document.addEventListener("DOMContentLoaded", () => {
    const refreshBtn = document.getElementById("refresh");

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
            chrome.storage.sync.set({ [button.id]: button.checked });
        });

    });

    // Bouton "Recharger la page"
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
        updateMsg.textContent = `✅ Extension à jour - Version local : ${updateInfo.localVersion}`;
        updateMsg.style.display = "block";
    }
});
