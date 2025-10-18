// canal partagé entre tous les onglets
const bc = new BroadcastChannel("toggleSync");

// quand un autre onglet envoie un signal → on recharge les états
bc.onmessage = (event) => {
    if (event.data === "sync") {
        console.log("🔄 Synchronisation des toggles demandé par un autre onglet");
        document.querySelectorAll('.toggle-button').forEach(button => {
            chrome.storage.sync.get(button.id, (data) => {
                button.checked = !!data[button.id];
            });
        });
    }
};

export function gestionToggle() {
    const toggleButtons = Array.from(document.querySelectorAll('.toggle-button'));
    const saveTimeouts = {};

    toggleButtons.forEach(button => {
        const id = button.id;
        const groupe = button.dataset.groupe;
        const groupeSynchro = button.dataset.groupeSynchro;
        
        let titleParts = [];
        if (groupe) titleParts.push(`Groupe exclusif:  ${groupe}`);
        if (groupeSynchro) titleParts.push(`Groupe synchro:  ${groupeSynchro}`);
        titleParts.push(`ID:  ${id}`);
        button.nextElementSibling.title = titleParts.join('\n');

        // Charger l'état initial
        chrome.storage.sync.get(id, (data) => {
            button.checked = !!data[id];
        });

        button.addEventListener('change', (e) => {
            const fromSync = e.detail?.fromSync || false;

            // Gestion des groupes exclusifs
            if (groupe && button.checked) {
                toggleButtons.forEach(other => {
                    if (other !== button && other.dataset.groupe === groupe && other.checked) {
                        other.checked = false;
                        other.dispatchEvent(new CustomEvent('change', { detail: { fromSync: true } }));
                    }
                });
            }

            // Gestion des groupes synchro
            if (groupeSynchro && !fromSync) {
                toggleButtons.forEach(other => {
                    if (other !== button && other.dataset.groupeSynchro === groupeSynchro) {
                        other.checked = button.checked;
                        other.dispatchEvent(new CustomEvent('change', { detail: { fromSync: true } }));
                    }
                });
            }

            // Sauvegarde avec debounce
            if (!fromSync) {
                const key = groupe || id; // si groupe existe, on sauvegarde tout le groupe
                clearTimeout(saveTimeouts[key]);
                saveTimeouts[key] = setTimeout(() => {
                    const state = {};
                    toggleButtons.forEach(btn => {
                        if (!groupe || btn.dataset.groupe === groupe) {
                            state[btn.id] = btn.checked;
                        }
                    });
                    chrome.storage.sync.set(state);
                    bc.postMessage("sync"); // avertir les autres onglets
                }, 200);

                // Gestion contextMenu
                if (button.id.includes('contextMenu'))
                    chrome.runtime.sendMessage({ type: "updateContextMenu" });
            }
        });
    });
}