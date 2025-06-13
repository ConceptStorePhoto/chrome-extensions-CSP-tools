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
