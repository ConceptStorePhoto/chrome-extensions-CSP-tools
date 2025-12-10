console.log("✅ Script injecté ! content-script-GLOBAL.js");

let hoveredLink = null;

// Détecter le lien survolé
document.addEventListener("mouseover", (e) => {
    const a = e.target.closest("a");
    hoveredLink = a?.href || null;
});

// Reçoit la commande pour copier l'URL
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg === "copy-hovered-link") {
        if (hoveredLink) {
            const domain = new URL(hoveredLink).hostname;
            navigator.clipboard.writeText(hoveredLink)
                .then(() => {
                    console.log("Lien copié :", hoveredLink);
                    displayNotif(`✅ Lien vers "${domain}" copié dans le presse-papiers.`);
                })
                .catch(err => console.error("Erreur copie :", err));
        } else {
            console.log("Aucun lien survolé.");
        }
    }
});

