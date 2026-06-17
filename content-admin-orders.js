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

    const keys = [
        "toggle_orders_view_copyAicm",
        "toggle_orders_view_copyCommandeNumber",
        "toggle_orders_view_openColissimoTracking",
        "toggle_orders_view_acceptPaymentStatus",
        "toggle_orders_view_messagePrefill",
        "toggle_orders_view_serialNumberTools",
        "toggle_orders_view_openEcomPrepNewCommande",
    ];
    chrome.storage.sync.get(keys, (data) => {
        if (data.toggle_orders_view_copyAicm) {
            console.log("🔄 Ajout des boutons de copie du code AICM");
            const elements = document.querySelectorAll(".productReference");
            elements.forEach((el) => {
                // Évite d'ajouter le bouton plusieurs fois
                if (el.querySelector("button.copier-btn")) return;

                // Vérifie que l'élément a du texte
                if (!el.innerText || el.innerText.trim() === "" || el.innerText.includes("Aucun code AICM")) return;

                const texte = el?.innerText.match(/(\d+)$/)?.[1];
                el.dataset.aicm = texte; // stocke le code AICM dans un data attribute pour éviter de devoir le recalculer au clic
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

            // copier le numéro de commande FNAC avec un bouton dans la ligne titre de la commande
            const fnacPanel = document.querySelector('#fnac-info-panel');
            let fullTextFnac = "";
            if (fnacPanel) {
                const fnacLogo = fnacPanel.querySelector('img');
                const fnacLabel = fnacPanel.querySelector('.fnac-label')?.textContent.trim();
                const fnacOrderNumber = fnacPanel.querySelector('.fnac-data')?.textContent.trim();
                if (fnacLabel && fnacOrderNumber) {
                    fullTextFnac = `${fnacLabel} ${fnacOrderNumber}`;
                    const copyButton = document.createElement('button');
                    copyButton.innerHTML = fnacLogo.outerHTML + fnacOrderNumber;
                    copyButton.title = "Copier le numéro de commande Fnac";
                    copyButton.className = "CSP_tools-copier-btn";
                    copyButton.onclick = () => {
                        navigator.clipboard.writeText(fullTextFnac).then(() => {
                            copyButton.style.backgroundColor = "#38ff66";
                            setTimeout(() => (copyButton.style.backgroundColor = ""), 1500);
                        });
                    };
                    document.querySelector('.title-row .title-content').appendChild(copyButton);
                }
            }

            // Ajout d'un bouton pour copier toutes les infos de la commande (ID, Référence, Fnac, Magasin)
            const copyAllButton = document.createElement('button');
            copyAllButton.innerText = "Copier infos";
            copyAllButton.title = "Copier toutes les informations de la commande (ID, Référence, Fnac, Magasin)";
            copyAllButton.className = "CSP_tools-copier-btn";
            /* villeStockage = a extraire de la ligne du prepier produit commande */
            const villeStockage = document.querySelector('.cellProduct .warehouse_order_detail select option:checked')?.innerText.trim().split('Concept Store Photo')[1]?.trim();
            copyAllButton.onclick = () => {
                const allInfo = `Commande ${commandeID} ${commandeREF} ${fullTextFnac ? `\n${fullTextFnac}` : ""} ${villeStockage ? `\n\nDépart de : ${villeStockage}` : ""}`;
                navigator.clipboard.writeText(allInfo).then(() => {
                    copyAllButton.style.backgroundColor = "#38ff66";
                    setTimeout(() => (copyAllButton.style.backgroundColor = ""), 1500);
                });
            };
            document.querySelector('.title-row .title-content').appendChild(copyAllButton);
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
        if (data.toggle_orders_view_acceptPaymentStatus) {
            const actionContainer = document.querySelector('#order-view-page .order-actions');
            const paymentStatusSelect = document.querySelector('#update_order_status_action_input');
            const updateStatusBtn = document.querySelector('#update_order_status_action_btn');
            if (actionContainer && paymentStatusSelect && (paymentStatusSelect?.value === "17" || (paymentStatusSelect?.value === "20" && document.querySelector('#fnac-info-panel')))) { // Check if status is "En attente de paiement PayPal"
                const acceptButton = document.createElement('button');
                acceptButton.type = "button";
                acceptButton.className = "btn btn-success mr-2";
                acceptButton.innerText = `Accepter le paiement ${document.querySelector('#fnac-info-panel') ? "Fnac" : "PayPal"}`;
                acceptButton.title = "Accepter le paiement de cette commande et mettre à jour le statut\nIndispensable récupérer les fonds via PayPal.";
                acceptButton.style.backgroundColor = "#28a745";
                acceptButton.style.borderColor = "#28a745";
                acceptButton.onclick = () => {
                    const confirmAccept = confirm("Voulez-vous vraiment accepter le paiement de cette commande ?");
                    if (!confirmAccept) return;
                    if (paymentStatusSelect && updateStatusBtn) {
                        paymentStatusSelect.value = "2"; // ID pour "Paiement accepté"
                        paymentStatusSelect.dispatchEvent(new Event('change'));
                        updateStatusBtn.click();
                    }
                }
                actionContainer.insertBefore(acceptButton, actionContainer.querySelector('.order-navigation'));
            }
        }
        // if (data.toggle_orders_view_openEcomPrepNewCommande) {
        //     const actionContainer = document.querySelector('#order-view-page .order-actions');
        //     if (actionContainer) {
        //         const prepButton = document.createElement('a');
        //         prepButton.className = "btn btn-info mr-2";
        //         prepButton.innerText = "Prépa. EcomPrep";
        //         prepButton.title = "Ouvrir la préparation de commande dans EcomPrep (si intégration configurée)";
        //         prepButton.style.backgroundColor = "#17a2b8";
        //         prepButton.style.borderColor = "#17a2b8";

        //         const orderId = document.querySelector('h1.d-inline [data-role="order-id"]')?.textContent.trim();
        //         const orderReference = document.querySelector('h1.d-inline [data-role="order-reference"]')?.textContent.trim();
        //         const customerName = document.querySelector('#addressInvoice>p:nth-child(2)')?.textContent.trim();
        //         const customerAddress = document.querySelector('#addressInvoice>p:nth-child(3)')?.textContent.trim();
        //         const customerCity = document.querySelector('#addressInvoice>p:nth-child(4)')?.textContent.trim();
        //         const lastChild = document.querySelector('#addressInvoice>p:last-child')?.textContent.trim();
        //         const customerCountry = (lastChild && /\d/.test(lastChild)) 
        //             ? document.querySelector('#addressInvoice>p:nth-last-child(2)')?.textContent.trim()
        //             : lastChild;
        //         const products = [];
        //         document.querySelectorAll('.cellProduct').forEach((row, index) => {
        //             const reference = row.querySelector('.productName')?.textContent.trim();
        //             console.log('reference :', reference);
        //             const sku = row.querySelector('.productReference')?.innerText.match(/(\d+)/)?.[1].trim();
        //             console.log('sku :', sku);
        //             const quantity = row.querySelector('.cellProductQuantity')?.textContent.trim().match(/^(\d+)/)[0] || row.querySelector('.cellProductQuantity .badge')?.textContent.trim() || "1";
        //             console.log('quantity :', quantity);
        //             if (reference && sku && quantity) {
        //                 products.push({ reference, sku, quantity });
        //             }
        //         });
        //         console.log({ orderId, orderReference, customerName, customerAddress, customerCity, customerCountry, products });
        //         const url = new URL("https://192.168.40.163:3001/commandes/new");
        //         url.searchParams.append("source", "SITE");
        //         url.searchParams.append("idExterne", `${orderId} ${orderReference}`);
        //         url.searchParams.append("clientNom", customerName?.split(' ')[1] || "");
        //         url.searchParams.append("clientPrenom", customerName?.split(' ')[0] || "");
        //         url.searchParams.append("clientAdresse", customerAddress) + ' ' + customerCity;
        //         url.searchParams.append("clientPays", customerCountry);
        //         products.forEach((prod, index) => {
        //             url.searchParams.append(`produit_${index + 1}_reference`, prod.reference);
        //             url.searchParams.append(`produit_${index + 1}_sku`, prod.sku);
        //             url.searchParams.append(`produit_${index + 1}_quantite`, prod.quantity);
        //         });
        //         console.log("URL de pré-remplissage pour EcomPrep :", url.toString());
        //         prepButton.href = url.toString();
        //         prepButton.target = "_blank";
        //         actionContainer.insertBefore(prepButton, actionContainer.querySelector('.order-navigation'));
        //     }
        // }
        if (data.toggle_orders_view_serialNumberTools) {
            // Pré-remplit le champ pour le numéro de série dans l'onglet Documents
            const orderDocumentsSectionButton = document.querySelector('#orderDocumentsTabContent table .documents-table-column-actions button');
            const orderDocumentsSectionInputTexte = document.querySelector('#orderDocumentsTabContent form input[type="text"]');
            const orderDocumentsSectionSubmit = document.querySelector('#orderDocumentsTabContent form button[type="submit"]');
            if (orderDocumentsSectionButton) {
                orderDocumentsSectionButton.click();
                // if (orderDocumentsSectionInputTexte && orderDocumentsSectionSubmit) {
                //     orderDocumentsSectionInputTexte.value = "Numéro de série : ";
                // }
            }

            // insert une div avant #order_hook_tabs
            const orderHookTabs = document.querySelector('#order_hook_tabs');
            if (orderHookTabs) {
                const newDiv = document.createElement('div');
                newDiv.id = "CSP_custom_div_before_order_hook_tabs";
                newDiv.classList.add('tab-content');
                newDiv.innerHTML = `<h3>Section CSPtools</h3>`;
                newDiv.innerHTML += `
                <label for="CSP_serial_number_input">Numéro de série :</label>
                <div class="input-group" style="gap:1rem;">
                    <input type="text" id="CSP_serial_number_input" name="CSP_serial_number_input" class="form-control" />
                    <button id="CSP_save_serial_number_btn" class="btn btn-primary">Enregistrer</button>
                </div>
                <span>Le numéro de série sera ajouté sur la Facture dans la section Documents de la commande. (⚠️Rechargement)</span>
                `;
                if (orderDocumentsSectionInputTexte && orderDocumentsSectionInputTexte.value.trim() != "") {
                    newDiv.querySelector('#CSP_serial_number_input').value = orderDocumentsSectionInputTexte.value.replace("Numéro de série : ", "").trim();
                }
                const saveButton = newDiv.querySelector('#CSP_save_serial_number_btn');
                saveButton.onclick = () => {
                    const serialNumber = newDiv.querySelector('#CSP_serial_number_input').value.trim();
                    if (serialNumber === "") {
                        alert("Veuillez entrer un numéro de série avant d'enregistrer.");
                        return;
                    }
                    // alert(`Numéro de série "${serialNumber}" enregistré !`);
                    if (orderDocumentsSectionInputTexte && orderDocumentsSectionInputTexte.value.trim() === "") {
                        orderDocumentsSectionInputTexte.value = `Numéro de série : ${serialNumber}`;
                        orderDocumentsSectionInputTexte.dispatchEvent(new Event('input'));
                        orderDocumentsSectionSubmit.click();
                    }
                    // const internal_note_note = document.querySelector('#internal_note_note'); // champ note interne texarea
                    // if (internal_note_note) {
                    //     internal_note_note.value= `Numéro de série : ${serialNumber} \n` + internal_note_note.value;
                    //     internal_note_note.dispatchEvent(new Event('input'));
                    //     const addNoteButton = document.querySelector('form[name="internal_note"] button[type="submit"]');
                    //     if (addNoteButton) addNoteButton.click();
                    // }
                };
                orderHookTabs.parentNode.insertBefore(newDiv, orderHookTabs);
            }
        }

        // modifie la hauteur du champ message
        const textareaMessage = document.querySelector('#order_message_message');
        if (textareaMessage) {
            textareaMessage.style.height = "250px";

            // message par défaut
            if (data.toggle_orders_view_messagePrefill && textareaMessage.value.trim() === "") {
                const defaultMessage = "Bonjour,\n\n\nCordialement";
                textareaMessage.value = defaultMessage;
                textareaMessage.dispatchEvent(new Event('input'));
            }
        }

    });

    // copier le numéro de commande FNAC au clic sur la ligne correspondante
    const fnacPanel = document.querySelector('#fnac-info-panel')
    fnacPanel.style.cursor = "copy";
    fnacPanel.title = "Cliquer pour copier le numéro de commande Fnac";
    fnacPanel?.addEventListener('click', function () {
        const fnacLabel = this.querySelector('.fnac-label')?.textContent.trim();
        const fnacOrderNumber = this.querySelector('.fnac-data')?.textContent.trim();
        if (fnacLabel && fnacOrderNumber) {
            navigator.clipboard.writeText(`${fnacLabel} ${fnacOrderNumber}`).then(() => {
                const originalBg = this.style.backgroundColor;
                this.style.backgroundColor = "yellow";
                setTimeout(() => {
                    this.style.backgroundColor = originalBg;
                }, 1500);
            });
        }
    });


    // coche automatiquement la case "Montrer au client" dans le champ message
    const checkboxMessage = document.querySelector('#order_message_is_displayed_to_customer');
    if (checkboxMessage) {
        checkboxMessage.checked = true;
        checkboxMessage.dispatchEvent(new Event('change'));
    }

    // Ajustements CSS divers
    document.querySelectorAll('.cellProductQuantity .badge ').forEach((el) => {
        el.style.fontSize = "unset";
        el.style.padding = "5px 15px";
    });
    document.querySelectorAll('.cellProductQuantity .form-control ').forEach((el) => {
        el.style.fontSize = "unset";
    });

}
else if (window.location.pathname.includes("orders") && window.location.pathname.split("/")[window.location.pathname.split("/").length - 1] == "") {
    console.log("✅ Page Liste des commandes, ajout des actions...");

    chrome.storage.sync.get(["toggle_orders_idWidth", "toggle_orders_trackingPatch", "toggle_orders_retraitMagasin", "toggle_orders_confirmStatus"], (data) => {
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
        if (data.toggle_orders_confirmStatus) {
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
                            document.getElementById('CSP_confirm_popup').style.display = 'flex'; // Afficher popup
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
    });

    document.querySelectorAll('.column-payment').forEach((el) => {
        if (el.innerText && el.innerText != "" && el.innerText == 'Fnac') {
            el.style.backgroundColor = "yellow";
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
