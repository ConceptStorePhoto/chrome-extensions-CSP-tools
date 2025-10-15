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

    // coche automatiquement la case "Montrer au client" dans le champ message
    const checkboxMessage = document.querySelector('#order_message_is_displayed_to_customer');
    if (checkboxMessage) {
        checkboxMessage.checked = true;
        checkboxMessage.dispatchEvent(new Event('change'));
    }

    // modifie la hauteur du champ message
    const textareaMessage = document.querySelector('#order_message_message');
    if (textareaMessage) {
        textareaMessage.style.height = "200px";
    }

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
                if (trackingNumber.length == 13) // Colissimo
                    el.innerHTML = `<a href="https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}" target="_blank" title="Ouvrir le Suivi de La Poste">${trackingNumber}</a>`;
                else if (trackingNumber.length == 18) // UPS
                    el.innerHTML = `<a href="https://www.ups.com/track?InquiryNumber1=${trackingNumber}&loc=fr_FR&TypeOfInquiryNumber=T&requester=ST/trackdetails" target="_blank" title="Ouvrir le Suivi UPS">${trackingNumber}</a>`;
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


    ///// Confirmation avant de changer le statut d'une commande /////
    const confirmStatuses = [6, 7]; // Statuts à confirmer (Annulé, Remboursé)
    const confirmMessage = "Attention ! Ce changement va rembourser automatiquement le client. Voulez-vous continuer ?";
    (function injectPopup() {
        if (document.getElementById('CSP_confirm_popup')) return;
        console.log("🔄 Injection du popup de confirmation pour changement de statut");
        const popupHTML = `
            <div id="CSP_confirm_popup" class="csp-popup-overlay" style="display:none;">
                <div class="csp-popup-content">
                <p>${confirmMessage}</p>
                <div class="csp-popup-buttons">
                    <button id="CSP_confirm_yes" class="csp-btn-confirm">Confirmer</button>
                    <button id="CSP_confirm_no" class="csp-btn-cancel">Annuler</button>
                </div>
                </div>
            </div>
            `;
        const style = `
            <style id="CSP_confirm_style">
                .csp-popup-overlay {
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.5);
                display:flex;
                justify-content:center;
                align-items:center;
                z-index: 9999;
                }
                .csp-popup-content {
                background: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 400px;
                text-align: center;
                font-family: Arial, sans-serif;
                }
                .csp-popup-buttons {
                margin-top: 15px;
                display: flex;
                justify-content: space-around;
                }
                .csp-btn-confirm, .csp-btn-cancel {
                padding: 8px 15px;
                border: none;
                cursor: pointer;
                }
                .csp-btn-confirm { background: #d9534f; color: white; }
                .csp-btn-cancel { background: #6c757d; color: white; }
            </style>
            `;
        document.body.insertAdjacentHTML('beforeend', popupHTML + style);
    })();

    (function handleDropdownConfirm() {
        let pendingClick = null;
        let confirmedClick = false; // <-- flag ajouté

        document.querySelectorAll('.js-dropdown-item').forEach(item => {
            item.addEventListener('click', function (e) {
                const value = parseInt(this.getAttribute('data-value'), 10);

                // Si c'est un clic confirmé, laisser passer
                if (confirmedClick) {
                    confirmedClick = false; // reset le flag
                    return; // ne rien bloquer
                }

                if (confirmStatuses.includes(value)) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();
                    console.log("⚠️ Changement de statut à confirmer :", value);
                    pendingClick = this; // Sauvegarder le bouton cliqué

                    // Afficher popup
                    document.getElementById('CSP_confirm_popup').style.display = 'flex';
                }
            }, true);
        });

        // Bouton CONFIRMER
        document.getElementById('CSP_confirm_yes').addEventListener('click', function () {
            document.getElementById('CSP_confirm_popup').style.display = 'none';
            if (pendingClick) {
                confirmedClick = true; // <-- on marque que le prochain clic est confirmé
                // Rejoue le clic
                const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
                pendingClick.dispatchEvent(evt);
                pendingClick = null;
            }
        });

        // Bouton ANNULER
        document.getElementById('CSP_confirm_no').addEventListener('click', function () {
            document.getElementById('CSP_confirm_popup').style.display = 'none';
            pendingClick = null;
        });
    })();

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
