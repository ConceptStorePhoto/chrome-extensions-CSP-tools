console.log("✅ Script injecté !  content-admin.js");

function catalogActions() {
    try {
        chrome.storage.sync.get("toggle_copy_aicm_buttons", (data) => {
            if (!data.toggle_copy_aicm_buttons) return; // Ne rien faire si désactivé
            console.log("🔄 Ajout des boutons de copie du code AICM");

            const elements = document.querySelectorAll(".column-reference");
            elements.forEach((el) => {
                // Évite d'ajouter le bouton plusieurs fois
                if (el.querySelector("button.copier-btn")) return;

                // Vérifie que l'élément a du texte
                if (!el.innerText || el.innerText.trim() === "" || el.innerText.includes("Aucun code AICM")) return;

                let texte = el.innerText;

                const bouton = document.createElement("button");
                bouton.innerText = "📋";
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
        });

        chrome.storage.sync.get("toggle_no_aicm_warning", (data) => {
            if (!data.toggle_no_aicm_warning) return; // Ne rien faire si désactivé

            const elements = document.querySelectorAll(".column-reference");
            elements.forEach((el) => {
                // Vérifie que l'élément a du texte
                if (!el.innerText || el.innerText.trim() === "" || el.innerText.includes("Aucun code AICM") || el.innerText.includes("Déclinaisons ?")) {
                    el.querySelector("a").innerText = "Aucun code AICM";
                    el.querySelector("a").setAttribute("style", "color: #c90000 !important"); // Met en rouge si pas de code
                    if (el.nextElementSibling.nextElementSibling && el.nextElementSibling.nextElementSibling.innerText == "0,00 €") {
                        el.querySelector("a").innerText = "Déclinaisons ?";
                    }
                }
            });
        });

        chrome.storage.sync.get("toggle_warning_HT_TTC", (data) => {
            if (!data.toggle_warning_HT_TTC) return; // Ne rien faire si désactivé

            const elements = document.querySelectorAll(".column-final_price_tax_excluded");
            elements.forEach((el) => {
                // Vérifie que l'élément existe et a du texte
                if (el.innerText && el.innerText.trim() !== "" && el.innerText != "0,00 €") {
                    if (el.innerText == el.nextElementSibling.innerText) {
                        el.querySelector("a").setAttribute("style", "color: #c90000 !important"); // Met en rouge si pas de code
                        el.nextElementSibling.querySelector("a").setAttribute("style", "color: #c90000 !important"); // Met en rouge si pas de code
                    }
                }
            });
        });

        chrome.storage.sync.get("toggle_copy_name_buttons", (data) => {
            if (!data.toggle_copy_name_buttons) return; // Ne rien faire si désactivé
            console.log("🔄 Ajout des boutons de copie du nom");

            const elements = document.querySelectorAll(".column-name");
            elements.forEach((el) => {
                // Évite d'ajouter le bouton plusieurs fois
                if (el.querySelector("button.copier-btn")) return;

                // Vérifie que l'élément a du texte
                if (!el.innerText || el.innerText.trim() === "") return;

                let texte = el.innerText;

                const bouton = document.createElement("button");
                bouton.innerText = "📋";
                bouton.className = "copier-btn";
                bouton.style.marginRight = "8px";
                bouton.style.borderRadius = "10px";
                bouton.style.border = "none";
                bouton.style.outline = "none";
                bouton.style.backgroundColor = "#e7e7e7";
                bouton.style.padding = "4px 8px";
                bouton.onclick = (event) => {
                    event.preventDefault();
                    event.stopPropagation(); // évite les comportements attachés ailleurs
                    navigator.clipboard.writeText(texte).then(() => {
                        bouton.innerText = "✅";
                        setTimeout(() => (bouton.innerText = "📋"), 1500);
                    });
                };

                el.prepend(bouton);
            });
        });

        // chrome.storage.sync.get("toggle_catalogue_preview_buttons", (data) => {
        //     if (!data.toggle_catalogue_preview_buttons) return; // Ne rien faire si désactivé
        //     console.log("🔄 Ajout des boutons de prévisualisation au catalogue");

        //     const elements = document.querySelectorAll(".grid-prévisualiser-row-link");
        //     elements.forEach((el) => {
        //         // Évite d'ajouter le bouton plusieurs fois
        //         if (el.parentNode.parentNode.querySelector("a.preview-btn")) return;

        //         //copier le bouton sélectioner dans l'élément parent
        //         let element = document.createElement("a");
        //         element.href = el.href;
        //         element.className = "preview-btn";
        //         element.target = "_blank";
        //         element.innerHTML = `<i class="material-icons">visibility</i>`;
        //         el.parentNode.parentNode.appendChild(element);
        //     });
        // });

        chrome.storage.sync.get("toggle_catalog_ungroup_action", (data) => {
            if (!data.toggle_catalog_ungroup_action) return; // Ne rien faire si désactivé
            console.log("🔄 Dégroupage des boutons d'action du catalogue");

            const elements = document.querySelectorAll(".btn-group .dropdown-menu");
            elements.forEach((el) => {
                //pour chaque élément du menu déroulant, on déplace les liens dans l'élément parent
                el.querySelectorAll("a").forEach((link) => {
                    let icon = link.querySelector('i');
                    link.title = link.textContent.split(' ')[14];
                    link.textContent = "";
                    link.appendChild(icon);
                    link.parentNode.parentNode.appendChild(link);
                });
                el.parentNode.parentNode.querySelector('a.dropdown-toggle').style.display = "none"; // Supprimer le bouton de menu déroulant
                el.remove(); // Supprimer le menu déroulant
            });
        });


        chrome.storage.sync.get("toggle_catalogue_masquer_horsTaxe", (data) => {
            if (!data.toggle_catalogue_masquer_horsTaxe) return; // Ne rien faire si désactivé
            console.log("🔄 Masquage hors taxe du catalogue");

            document.querySelectorAll("[data-column-id='final_price_tax_excluded']").forEach((el) => {
                el.style.display = "none";
            });

            const elements = document.querySelectorAll(".column-final_price_tax_excluded");
            elements.forEach((el) => {
                el.style.display = "none";
            });
        });


        chrome.storage.sync.get("toogle_lbc_copy", (data) => {
            if (!data.toogle_lbc_copy) return; // Ne rien faire si désactivé
            console.log("🔄 Ajout bouton LBC copy");

            const table = document.querySelectorAll('#product_grid_table tbody tr');
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

                line.querySelector('.column-actions>div').appendChild(boutonCopier);

                boutonCopier.addEventListener('click', () => {
                    const name = line.querySelector('.column-name').innerText.trim();
                    const aicm = line.querySelector('.column-reference>a').innerText.trim();
                    const prix = line.querySelector('.column-price_tax_included').innerText;
                    let dataCopy = { name: name, aicm: aicm, prix: prix };
                    chrome.storage.sync.set({ "lbc_copy_data": dataCopy });
                    console.log("Donnée copiée : ", dataCopy);
                    navigator.clipboard.writeText(aicm);
                    boutonCopier.innerText = "✅LBC";
                    setTimeout(() => (boutonCopier.innerText = "📋LBC"), 1500);
                });
            });
        });

        chrome.storage.sync.get(["toogle_catalog_color_line", "catalog_color_highlight", "catalog_color_highlight_default"], (data) => {
            if (!data.toogle_catalog_color_line) return; // Ne rien faire si désactivé
            console.log("🔄 Activer Colorer ligne cliquée");

            const HIGHLIGHT = 'ps‑row‑highlight';
            const highlightColor = data.catalog_color_highlight || data.catalog_color_highlight_default

            const style = document.createElement('style');
            style.textContent = `
                .${HIGHLIGHT} {
                background-color: ${highlightColor} !important;   /* couleur de surbrillance */
                transition: background-color 120ms ease;
                }
            `;
            document.head.appendChild(style);

            /* Délégation d’événements : Avantage : une seule écoute pour tous les <tr>, même ajoutés dynamiquement. */
            document.addEventListener('click', (e) => {
                const tr = e.target.closest('tr');  // monte jusqu’au <tr> le plus proche
                if (!tr || tr.matches('.column-headers, .column-filters')) return;  // on a cliqué ailleurs on ignore en‑têtes & filtres

                // 3. Retire la surbrillance éventuelle
                const actif = document.querySelector(`.${HIGHLIGHT}`);
                if (actif && actif !== tr) actif.classList.remove(HIGHLIGHT);

                // 4. Ajoute la surbrillance à la ligne cliquée
                tr.classList.add(HIGHLIGHT);
            });
        });

        chrome.storage.sync.get(["toogle_catalog_color_remplacement", "catalog_color_remplacement", "catalog_color_remplacement_default"], (data) => {
            if (!data.toogle_catalog_color_remplacement) return; // Ne rien faire si désactivé
            console.log("🔄 Remplacement du bleu ilisible");

            // const ancienneCouleur = 'rgb(37, 185, 215)'; // équivalent de #25b9d7 en RGB
            const ancienneCouleur = hexToRGB('#25b9d7'); // équivalent de #25b9d7 en RGB
            const nouvelleCouleur = data.catalog_color_remplacement || data.catalog_color_remplacement_default;

            // Parcourt tous les éléments visibles de la page
            document.querySelectorAll('*').forEach(el => {
                const style = getComputedStyle(el);
                if (style.color === ancienneCouleur) {
                    el.setAttribute('style', `color: ${nouvelleCouleur} !important`);
                }
            });

            function hexToRGB(hex) {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgb(${r}, ${g}, ${b})`;
            }
        });


    } catch (error) {
        console.error("Erreur lors de l'ajout des boutons/actions dans le catalogue :", error);
    }
}

function productActions() {
    chrome.storage.sync.get("toggle_product_preview_buttons", (data) => {
        if (!data.toggle_product_preview_buttons) return; // Ne rien faire si désactivé
        console.log("🔄 Ajout des boutons de prévisualisation");

        const elements = document.querySelectorAll("#product_footer_actions_preview");
        elements.forEach((el) => {
            //copier le bouton sélectioner dans l'élément parent
            let element = document.createElement("a");
            element.href = el.href;
            element.title = "Prévisualiser";
            element.target = "_blank";
            element.innerHTML = `<i class="material-icons">visibility</i>`;
            el.parentNode.parentNode.appendChild(element);
        });

    });

    chrome.storage.sync.get("toggle_product_ungroup_action", (data) => {
        if (!data.toggle_product_ungroup_action) return; // Ne rien faire si désactivé
        console.log("🔄 Dégroupage des boutons d'action du produit");

        const elements = document.getElementById('product_footer_actions_dropdown');
        elements.parentElement.querySelectorAll(".dropdown-menu>*").forEach((link) => {
            link.style.whiteSpace = "nowrap";
            link.style.marginLeft = "15px";
            link.parentNode.parentNode.appendChild(link);
        });
        elements.parentNode.parentNode.querySelector('a.dropdown-toggle').style.display = "none"; // Supprimer le bouton de menu déroulant
        elements.remove(); // Supprimer le menu déroulant
        document.getElementById('product_footer_actions_catalog').style.whiteSpace = "nowrap";
    });


    chrome.storage.sync.get(["toggle_remise_calcul", "toggle_heureFin"], (data) => {
        if (!data.toggle_remise_calcul && !data.toggle_heureFin) return; // Ne rien faire si désactivé
        // console.log("🔄 Ajout du calcul de remise");

        const prix_de_baseTTC = parseFloat(document.querySelector("#product_pricing_retail_price_price_tax_included").value); // Prix de base TTC
        console.log("🔄 Prix de base TTC :", prix_de_baseTTC);

        // console.log('Produit avec déclinaison ? ', document.getElementById('product_combinations-tab-nav')); //attention au produit variable !!
        // let combinations = [];
        // if (document.getElementById('product_combinations-tab-nav')) {
        //     new MutationObserver((_, obs) => {
        //         const rows = document.querySelectorAll("tr.combination-list-row");
        //         if (!rows.length) return;

        //         obs.disconnect(); // stoppe l'observation après détection

        //         combinations = Array.from(rows).map((row, i) => {
        //             const name = row.querySelector(`input[name="combination_list[${i}][name]"]`)?.value?.trim();
        //             const price = row.querySelector(`input[name="combination_list[${i}][impact_on_price_ti]"]`)?.value?.replace(',', '.');

        //             return name && price ? { name, impact_price_ttc: parseFloat(price), calcul_prix_ttc_final: prix_de_baseTTC + parseFloat(price) } : null;
        //         }).filter(Boolean);

        //         // Tu peux maintenant utiliser `combinations` dans le reste de ton code
        //         console.log("➡️ Déclinaisons chargées :", combinations);
        //     }).observe(document.querySelector("#combination_list"), { childList: true, subtree: true });
        // }


        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.id === "modal-specific-price-form") {
                        console.log("✅ Popup détecté !");

                        // Attendre que l'iframe soit complètement chargé
                        const iframe = node.querySelector('iframe');
                        if (!iframe) {
                            console.log("⚠️ Pas d'iframe trouvé");
                            return;
                        }
                        iframe.addEventListener('load', () => {
                            console.log("✅ Iframe chargé !");
                            try {
                                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                                if (data.toggle_remise_calcul) {
                                    // Exemple : chercher un champ dans l'iframe
                                    const remise = iframeDoc.querySelector('#specific_price_impact_reduction_value');
                                    const divPrix = iframeDoc.querySelector('#specific_price_impact_reduction');
                                    if (divPrix) {
                                        console.log("🎯 div prix trouvée : ajout de l'input");

                                        //cree l'imput pour le prix apres remise
                                        const inputPrixApresRemise = document.createElement('input');
                                        inputPrixApresRemise.type = 'text';
                                        inputPrixApresRemise.title = `vCalcul auto : [Prix TTC de l'article] - [cette zone] = [remise dans la case à coté]  // Attention aux produits variable`;
                                        inputPrixApresRemise.setAttribute('style', 'width: 155px !important;');
                                        inputPrixApresRemise.style.marginLeft = '20px';
                                        inputPrixApresRemise.placeholder = 'Prix après remise TTC';
                                        divPrix.prepend(inputPrixApresRemise);
                                        inputPrixApresRemise.addEventListener('input', () => {
                                            const prixApresRemise = parseFloat(inputPrixApresRemise.value);
                                            console.log('🔄 Prix après remise TTC :', prixApresRemise);
                                            remise.value = parseFloat(document.querySelector("#product_pricing_retail_price_price_tax_included").value) - prixApresRemise;
                                        });

                                        // const declinaisonSelect = iframeDoc.querySelector('#specific_price_combination_id');
                                        // if (declinaisonSelect) {
                                        //     const affichePrixDecli = document.createElement('span');
                                        //     affichePrixDecli.textContent = "test";
                                        //  // NE FONCTIONNE PAS !!
                                        //     declinaisonSelect.addEventListener('change', function () {
                                        //         const selectedText = declinaisonSelect.options[declinaisonSelect.selectedIndex].text;
                                        //         console.log('➡️ text select : ', selectedText); 

                                        //         // Recherche dans le tableau l'objet qui correspond au texte sélectionné
                                        //         const found = combinations.find(item => item.name === selectedText);

                                        //         if (found) {
                                        //             affichePrixDecli.textContent = `Prix final TTC : ${found.calcul_prix_ttc_final} €`;
                                        //         } else {
                                        //             affichePrixDecli.textContent = "Prix non dispo pour cette sélection";
                                        //         }
                                        //     });

                                        //     declinaisonSelect.parentElement.appendChild(affichePrixDecli);
                                        // }

                                    } else {
                                        console.log('❌ div prix introuvable dans iframe');
                                    }
                                }

                                if (data.toggle_heureFin) {
                                    const divDateFin = iframeDoc.querySelector('div.input-group.date-range.row>div:last-child');
                                    if (divDateFin) {
                                        divDateFin.style.marginLeft = "100px";

                                        // quand la check box #specific_price_date_range_unlimited est décocher on change l'atribut 
                                        const checkbox = iframeDoc.querySelector('#specific_price_date_range_unlimited');
                                        if (checkbox) {
                                            checkbox.addEventListener('change', () => {
                                                console.log("🔄 Checkbox date ilimité changed :", checkbox.checked);
                                                if (!checkbox.checked) {
                                                    // NE FONCTIONNE PAS .... :/
                                                    let dateValue = divDateFin.querySelector('#specific_price_date_range_to').getAttribute('data-default-value');
                                                    let newDateValue = dateValue.split(' ')[0] + '23:59:59'; // Mettre l'heure à 23:59:59
                                                    divDateFin.querySelector('#specific_price_date_range_to').value = newDateValue; // Mettre à jour la valeur de l'input
                                                    divDateFin.querySelector('#specific_price_date_range_to').dispatchEvent(new Event('input', { bubbles: true }));
                                                    divDateFin.querySelector('#specific_price_date_range_to').dispatchEvent(new Event('change', { bubbles: true }));
                                                }
                                            });
                                        }
                                    }
                                }

                            } catch (err) {
                                console.log("❌ Erreur d'accès à l'iframe :", err);
                            }
                        });
                    }
                });
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });


    chrome.storage.sync.get("toggle_taxe_ttc", (data) => {
        if (!data.toggle_taxe_ttc) return; // Ne rien faire si désactivé
        console.log("🔄 Ajout le bouton de swap de taxe et prix ttc");

        const elemPrixHT = document.getElementById('product_pricing_retail_price_price_tax_excluded');
        const select = document.querySelector('#product_pricing_retail_price_tax_rules_group_id'); // Récupère le <select>
        const elemPrixTTC = document.getElementById('product_pricing_retail_price_price_tax_included');
        const container = document.getElementById('product_pricing_retail_price');

        if (select.value != "2") {
            const button = document.createElement("span");
            button.innerText = "Swap taxe standard";
            button.className = "btn-swap";
            const style = document.createElement('style');
            style.textContent = `
                .btn-swap {
                    font-size: 16px;
                    padding: 8px 15px;
                    background-color: #007bff;
                    color: #fff;
                    border-radius: 5px;
                    text-decoration: none;
                    margin-left: 20px;
                    margin-top: 25px;
                    height: fit-content;
                    cursor: pointer;
                }

                .btn-swap:hover {
                    background-color: #0056b3;
                }
            `;
            document.head.appendChild(style);

            button.addEventListener('click', clique);
            function clique() {
                // Change la valeur (ex. : "2" pour "standard")
                select.value = "2";
                // Déclenche l'événement 'change' pour que Select2 se mette à jour
                select.dispatchEvent(new Event('change', { bubbles: true }));

                elemPrixTTC.value = parseFloat(elemPrixHT.value);
                elemPrixTTC.dispatchEvent(new Event('input', { bubbles: true }));
                elemPrixTTC.dispatchEvent(new Event('change', { bubbles: true }));
                button.removeEventListener('click', clique);
                button.remove();
            }
            container.appendChild(button);
        }
    });

}


/////// Exécution initiale

// déclenchement des actions sur les pages correspondantes
// const observerCatalog = "";
console.log("🔄 Vérification du type de page :", window.location.pathname.split("/"));
if (window.location.pathname.split("/")[window.location.pathname.split("/").length - 1] == "" && window.location.pathname.includes("catalog")) {
    console.log("✅ Page catalogue détectée, ajout des actions...");
    catalogActions();
    document.title = "Catalogue " + document.title; // Change le titre de la page pour le catalogue
    // MutationObserver pour suivre les changements du DOM => je crois que ce n'est pas nécessaire ici
    // observerCatalog = new MutationObserver(catalogActions);
    // observerCatalog.observe(document.body, { childList: true, subtree: true });
}
else if (window.location.pathname.split("/")[window.location.pathname.split("/").length - 1] == "edit" && window.location.pathname.includes("products-v2")) {
    console.log("✅ Page produit détectée, ajout des actions...");
    productActions();
    const productName = document.getElementById('product_header_name_1').value;
    if (productName)
        document.title = "Modifier  « " + productName + " » | " + document.title; // Change le titre de la page pour le catalogue
    else
        document.title = "Modifier " + document.title; // Change le titre de la page pour le catalogue
}

// récupération du token dans l'url du site si page admin
if (window.location.search.includes('token=')) {
    let token = window.location.search.split('=')[window.location.search.split('=').length - 1]; // récupère le dernier paramètre de l'URL
    console.log("✅ Token récupéré depuis l'URL :", token);
    chrome.storage.sync.set({ token_admin: token }); // stock la valeur actuelle
}

