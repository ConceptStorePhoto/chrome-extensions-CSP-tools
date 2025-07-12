// Gestion de l'input color
export function gestionColorInput() {
    document.querySelectorAll('.divSliderButton input[type="color"]').forEach(colorInput => {
        const id = colorInput.id;
        const id_default = id + "_default";
        let defaultColor = "";
        //  Charger la couleur enregistrée (ou mettre la valeur par défaut)
        chrome.storage.sync.get([id, id_default], (data) => {
            colorInput.value = data[id] || data[id_default];
            defaultColor = data[id_default];
            // if (!data[id])  // masque le bouton de réinitialisation si pas de couleur personnalisée
            //     colorInput.parentElement.querySelector('.reset-btn').classList.add('hide');
        });
        // Enregistrer la nouvelle couleur quand elle change
        colorInput.addEventListener('change', () => {
            const nouvelleCouleur = colorInput.value;
            chrome.storage.sync.set({ [id]: nouvelleCouleur }, () => {
                console.log("🎨 Couleur de remplacement enregistrée :", nouvelleCouleur);
                // colorInput.parentElement.querySelector('.reset-btn').classList.remove('hide');
            });
        });
        // Clic sur le bouton de réinitialisation
        colorInput.parentElement.querySelector('.reset-btn').addEventListener('click', () => {
            colorInput.value = defaultColor;
            chrome.storage.sync.remove(id, () => {
                console.log('🎨 Couleur personnalisée supprimée ; retour au réglage par défaut.');
                // colorInput.parentElement.querySelector('.reset-btn').classList.add('hide');
            });
        });
    });
}