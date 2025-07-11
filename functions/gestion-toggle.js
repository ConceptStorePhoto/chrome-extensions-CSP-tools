// fonction pour gérer les toggles
export function gestionToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-button');
    toggleButtons.forEach(button => {
        const id = button.id;
        const groupe = button.dataset.groupe;

        // Charger l'état actuel pour chaque bouton
        chrome.storage.sync.get(id, (data) => {
            button.checked = !!data[id];
        });

        // Mise à jour de l'état 
        button.addEventListener('change', () => {
            // Si le bouton fait partie d'un groupe
            if (groupe && button.checked) {
                // Désactiver les autres boutons du même groupe
                toggleButtons.forEach(other => {
                    if (other !== button && other.dataset.groupe === groupe && other.checked) {
                        other.checked = false;
                        other.dispatchEvent(new Event('change'));
                    }
                });
            }
            chrome.storage.sync.set({ [button.id]: button.checked }, () => {
                if (button.id.includes('contextMenu'))
                    chrome.runtime.sendMessage({ type: "updateContextMenu" });
            });
        });
    });
}