// Gestion de l'input color
export function gestionColorInput() {
    const colorInput = document.getElementById('color_remplacement');
    let defaultColor = "";
    // Charger la couleur enregistrée (ou mettre la valeur par défaut)
    chrome.storage.sync.get(["catalog_color_remplacement", "catalog_color_remplacement_default"], (data) => {
        colorInput.value = data.catalog_color_remplacement || data.catalog_color_remplacement_default;
        defaultColor = data.catalog_color_remplacement_default;
    });
    // Enregistrer la nouvelle couleur quand elle change
    colorInput.addEventListener('input', () => {
        const nouvelleCouleur = colorInput.value;
        chrome.storage.sync.set({ catalog_color_remplacement: nouvelleCouleur }, () => {
            console.log("🎨 Couleur de remplacement enregistrée :", nouvelleCouleur);
        });
    });
    // Clic sur le bouton de réinitialisation
    document.getElementById('reset_color').addEventListener('click', () => {
        colorInput.value = defaultColor;
        chrome.storage.sync.remove('catalog_color_remplacement', () => {
            console.log('🎨 Couleur personnalisée supprimée ; retour au réglage par défaut.');
        });
    });
}