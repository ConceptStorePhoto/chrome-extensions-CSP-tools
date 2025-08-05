console.log("✅ Script injecté !  content-admin-catalog.js");

/////// Exécution initiale ///////

if (window.location.pathname.includes("orders") && window.location.pathname.split("/")[window.location.pathname.split("/").length - 1] == "view") {
    console.log("✅ Page Détail de commande, ajout des actions...");

    chrome.storage.sync.get(["toggle_orders_view_copyAicm"], (data) => {
        if (data.toggle_orders_view_copyAicm) {
            console.log("🔄 Ajout des boutons de copie du code AICM");
            const elements = document.querySelectorAll(".productReference");
            elements.forEach((el) => {
                // Évite d'ajouter le bouton plusieurs fois
                if (el.querySelector("button.copier-btn")) return;

                // Vérifie que l'élément a du texte
                if (!el.innerText || el.innerText.trim() === "" || el.innerText.includes("Aucun code AICM")) return;

                const texte = el?.innerText.match(/(\d+)$/)?.[1];
                console.log('numéro produit :', texte);
                const bouton = document.createElement("button");
                bouton.innerText = "📋";
                bouton.title = "Copier le code AICM";
                bouton.className = "copier-btn";
                bouton.style.marginLeft = "8px";
                bouton.style.borderRadius = "10px";
                bouton.style.border = "none";
                bouton.style.outline = "none";
                bouton.style.backgroundColor = "#e7e7e7";
                bouton.style.padding = "4px 8px";
                bouton.onclick = (event) => {
                    event.preventDefault();
                    // event.stopPropagation(); // évite les comportements attachés ailleurs
                    navigator.clipboard.writeText(texte).then(() => {
                        bouton.innerText = "✅";
                        setTimeout(() => (bouton.innerText = "📋"), 1500);
                    });
                };
                el.appendChild(bouton);
            });
        }

    });

}