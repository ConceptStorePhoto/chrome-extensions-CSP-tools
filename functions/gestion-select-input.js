// Gestion select
export function gestionSelectInput() {
    document.querySelectorAll('.divSliderButton select').forEach(elem => {
        const id = elem.id;
        const id_default = id + "_default";
        let defaultValue = "";
        //  Charger la couleur enregistrée (ou mettre la valeur par défaut)
        chrome.storage.sync.get([id, id_default], (data) => {
            elem.value = data[id] || data[id_default];
            defaultValue = data[id_default];
        });
        // Enregistrer la nouvelle valeur quand elle change
        elem.addEventListener('change', () => {
            const nouvelleCouleur = elem.value;
            chrome.storage.sync.set({ [id]: nouvelleCouleur }, () => {
                console.log("🎨 Modification enregistrée :", nouvelleCouleur);
            });
        });
        // Clic sur le bouton de réinitialisation
        elem.parentElement.querySelector('.reset-btn').addEventListener('click', () => {
            elem.value = defaultValue;
            chrome.storage.sync.remove(id, () => {
                console.log('🎨 Valeur custom supprimée ; retour au réglage par défaut.');
            });
        });
    });
}