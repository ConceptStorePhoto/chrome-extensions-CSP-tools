console.log("✅ Script injecté !  content-admin-WP.js");

try {
    const table = document.querySelectorAll('tbody#the-list tr');
    if (table.length >= 1) {
        console.log("🔄 Ajout bouton LBC copy");
        table.forEach((line) => {
            //création du bouton
            const boutonCopier = document.createElement('span');
            boutonCopier.innerText = "📋LBC";
            boutonCopier.style.marginRight = "8px";
            boutonCopier.style.borderRadius = "10px";
            boutonCopier.style.border = "none";
            boutonCopier.style.outline = "none";
            boutonCopier.style.backgroundColor = "#e7e7e7";
            boutonCopier.style.padding = "4px 8px";
            boutonCopier.style.cursor = "pointer";
            boutonCopier.style.display = "flex";
            boutonCopier.style.alignItems = "center";
            boutonCopier.style.minWidth = "fit-content";

            line.querySelector('.column-date').appendChild(boutonCopier);

            boutonCopier.addEventListener('click', () => {
                const name = line.querySelector('.column-name .row-title').innerText.trim();
                const aicm = line.querySelector('.column-sku').innerText.trim();
                const prix = line.querySelector('.column-price').innerText;
                let dataCopy = { name: name, aicm: aicm, prix: prix };
                chrome.storage.sync.set({ "lbc_copy_data": dataCopy });
                console.log("Donnée copiée : ", dataCopy);
                navigator.clipboard.writeText(aicm);
                boutonCopier.innerText = "✅LBC";
                setTimeout(() => (boutonCopier.innerText = "📋LBC"), 1500);
            });
        });
    }
} catch (error) {
    console.error("Erreur lors de l'ajout des boutons/actions dans le catalogue WordPress :", error);
}