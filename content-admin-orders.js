console.log("✅ Script injecté !  content-admin-orders.js");

/////// Exécution initiale ///////

const style = document.createElement("style");
style.textContent = `
        .CSP_tools-copier-btn {
            margin-left: 8px;
            border-radius: 10px;
            border: none;
            outline: none !important;
            background-color: #e7e7e7;
            padding: 4px 8px;
        }`;
document.head.appendChild(style);

if (window.location.pathname.includes("orders") && window.location.pathname.split("/")[window.location.pathname.split("/").length - 1] == "view" && !window.location.pathname.includes("carts")) {
    console.log("✅ Page Détail de commande, ajout des actions...");

    chrome.storage.sync.get(["toggle_orders_view_copyAicm", "toggle_orders_view_copyCommandeNumber", "toggle_orders_view_openColissimoTracking"], (data) => {
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
                bouton.className = "CSP_tools-copier-btn";
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
        if (data.toggle_orders_view_copyCommandeNumber) {
            const commandeID = document.querySelector('h1.d-inline [data-role="order-id"]')?.textContent.trim();
            const commandeREF = document.querySelector('h1.d-inline [data-role="order-reference"]')?.textContent.trim();
            const commandeNAME = `Commande ${commandeID} ${commandeREF}`;
            console.log(commandeNAME);
            const bouton = document.createElement("button");
            bouton.innerText = "📋";
            bouton.title = "Copier le numéro de commande";
            bouton.className = "CSP_tools-copier-btn";
            bouton.onclick = (event) => {
                event.preventDefault();
                navigator.clipboard.writeText(commandeNAME).then(() => {
                    bouton.innerText = "✅";
                    setTimeout(() => (bouton.innerText = "📋"), 1500);
                });
            };
            document.querySelector('h1.d-inline').prepend(bouton);
        }
        if (data.toggle_orders_view_openColissimoTracking) {
            const listeColissimoNumber = document.querySelectorAll('.colissimo-shipment-number');
            listeColissimoNumber.forEach((item) => {
                const boutonSuivi = document.createElement('a');
                boutonSuivi.innerText = "Ouvrir Suivi";
                boutonSuivi.title = "Ouvrir le Suivi sur le site de La Poste";
                boutonSuivi.target = '_blank';
                boutonSuivi.className = 'CSP_tools-copier-btn';
                boutonSuivi.style.fontSize = "12px";
                boutonSuivi.href = `https://www.laposte.fr/outils/suivre-vos-envois?code=${item.innerText}`;
                item.parentElement.prepend(boutonSuivi);
            });
        }

    });
}
else if (window.location.pathname.includes("orders") && window.location.pathname.split("/")[window.location.pathname.split("/").length - 1] == "") {
    console.log("✅ Page Liste des commandes, ajout des actions...");

    chrome.storage.sync.get(["toggle_orders_idWidth", "toggle_orders_trackingPatch", "toggle_orders_retraitMagasin"], (data) => {
        if (data.toggle_orders_idWidth) {
            document.querySelectorAll('.column-id_order').forEach((el) => {
                el.style.minWidth = "80px";
            });
        }
        if (data.toggle_orders_trackingPatch) {
            document.querySelectorAll('.column-tracking_number').forEach((el) => {
                el.style.minWidth = "120px";
                const trackingNumber = el.innerText.trim();
                el.innerHTML = `<a href="https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}" target="_blank" title="Ouvrir le Suivi sur le site de La Poste">${trackingNumber}</a>`;
            });
        }
        if (data.toggle_orders_retraitMagasin) {
            document.querySelectorAll('.column-store').forEach((el) => {
                if (el.innerText && el.innerText != "") {
                    const ville = el.innerText?.split('Concept Store Photo')[1]?.trim();
                    // el.innerHTML = `<b>${ville}</b>`;
                    el.innerText = ville;
                }
            });
        }
    });
}
else if (window.location.pathname.includes("orders/carts/")) {
    console.log("✅ Page Panier (carts), ajout des actions...");

    chrome.storage.sync.get(["toggle_orders_carts_copyAicm"], (data) => {
        if (data.toggle_orders_carts_copyAicm) {
            console.log("🔄 Ajout des boutons de copie du code AICM");

            const elements = document.querySelectorAll('div[data-role="cart-summary"] .table a');
            console.log(elements);
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
                bouton.className = "CSP_tools-copier-btn";
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
