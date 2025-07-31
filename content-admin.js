console.log("✅ Script injecté !  content-admin.js");

/////// Exécution initiale ///////

// Déclenchement des actions sur les pages correspondantes
console.log("🔄 Vérification du type de page :", window.location.pathname.split("/"));
if (window.location.pathname.split("/")[window.location.pathname.split("/").length - 1] == "" && window.location.pathname.includes("catalog")) {
    console.log("✅ Page catalogue détectée, ajout des actions...");
    catalogActions();
    document.title = "Catalogue " + document.title; // Change le titre de la page pour le catalogue
}
else if (window.location.pathname.split("/")[window.location.pathname.split("/").length - 1] == "edit" && window.location.pathname.includes("products-v2")) {
    console.log("✅ Page produit détectée, ajout des actions...");
    productActions();
}

// récupération du token dans l'url du site si page admin
let token = "";
if (window.location.search.includes('token=')) {
    token = window.location.search.split('=')[window.location.search.split('=').length - 1]; // récupère le dernier paramètre de l'URL
    console.log("✅ Token récupéré depuis l'URL :", token);
    chrome.storage.local.set({ token_admin: token }); // stock la valeur actuelle
}

/////// FONCTIONS ///////

function catalogActions() {
    try {
        const keys = [
            "toggle_catalog_patch_category_filter",
            "toggle_catalog_copy_aicm_buttons",
            "toggle_catalog_no_aicm_warning",
            "toggle_catalog_display_combinations",
            "toggle_catalog_warning_HT_TTC",
            "toggle_catalog_copy_name_buttons",
            "toggle_catalog_preview_buttons",
            "toggle_catalog_ungroup_action",
            "toggle_catalog_masquer_horsTaxe",
            "toggle_catalog_lbc_copy",
            "toggle_catalog_color_line",
            "catalog_color_highlight",
            "catalog_color_highlight_default",
            "toggle_catalog_color_remplacement",
            "catalog_color_remplacement",
            "catalog_color_remplacement_default"
        ];
        chrome.storage.sync.get(keys, (data) => {
            if (data.toggle_catalog_patch_category_filter) {
                console.log("🔄 Patch de la hauteur du filtre catégorie");
                const filtreCategorie = document.querySelector('.dropdown-menu.category-filter-menu');
                filtreCategorie.style.maxHeight = "70vh"; // Limite la hauteur du menu déroulant des catégories
                filtreCategorie.style.width = "400px";
                filtreCategorie.style.overflowY = "auto";
            }

            if (data.toggle_catalog_copy_aicm_buttons) {
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
            }

            if (data.toggle_catalog_no_aicm_warning) {
                const elements = document.querySelectorAll(".column-reference");
                elements.forEach((el) => {
                    // Vérifie que l'élément n'a pas de texte ou est vide
                    if ((!el.innerText || el.innerText.trim() === "") && (!el.innerText.includes("Aucun code AICM") || !el.innerText.includes("Déclinaisons ?"))) {
                        el.querySelector("a").innerText = "Aucun code AICM";
                        el.querySelector("a").setAttribute("style", "color: #c90000 !important"); // Met en rouge si pas de code
                        if (el.nextElementSibling.nextElementSibling && el.nextElementSibling.nextElementSibling.innerText == "0,00 €") {
                            el.querySelector("a").innerText = "Déclinaisons ?";
                        }
                    }
                });
            }

            if (data.toggle_catalog_display_combinations) {
                const elements = document.querySelectorAll(".column-reference");
                elements.forEach((el) => {
                    // Vérifie que l'élément n'a pas de texte ou est vide
                    if (!el.innerText || el.innerText.trim() === "" || el.innerText.includes("Aucun code AICM") || el.innerText.includes("Déclinaisons ?")) {
                        getCombinations(el.previousElementSibling.previousElementSibling.previousElementSibling.innerText, token, "", "", (liste) => {
                            const refsConcatenees = liste.map(c => c.ref).filter(ref => ref).join(" ");
                            // console.log("💡Référence concaténée :", refsConcatenees);
                            if (refsConcatenees) {
                                el.style.maxWidth = "200px";
                                el.querySelector("a").innerText = `${liste.length} Déclinaisons :\n`;
                                const elem = document.createElement('span');
                                elem.style.cssText = 'white-space: normal !important;';
                                elem.innerText = refsConcatenees;
                                el.appendChild(elem);
                            } else if (liste.length != 0)
                                el.querySelector("a").innerText = `${liste.length} Déclinaisons :\nAucun code AICM`;

                            const prixListe = liste.map(c => parseFloat(c.calcul_prix_ttc_final)).filter(p => !isNaN(p));
                            if (prixListe.length > 0) {
                                const min = Math.min(...prixListe);
                                const max = Math.max(...prixListe);

                                const intervalPrix = document.createElement('div');
                                intervalPrix.style.cssText = 'white-space: nowrap !important;';
                                intervalPrix.innerText = (min === max)
                                    ? `${min.toFixed(2)}€`
                                    : `${min.toFixed(2)}€ - ${max.toFixed(2)}€`;
                                el.nextElementSibling.nextElementSibling.nextElementSibling.appendChild(intervalPrix);
                            }
                        });
                    }
                });

            }

            if (data.toggle_catalog_warning_HT_TTC) {
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
            }

            if (data.toggle_catalog_copy_name_buttons) {
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
            }

            if (data.toggle_catalog_preview_buttons) {
                console.log("🔄 Ajout des boutons de prévisualisation au catalogue");
                const elements = document.querySelectorAll(".grid-prévisualiser-row-link");
                elements.forEach((el) => {
                    // Évite d'ajouter le bouton plusieurs fois
                    if (el.parentNode.parentNode.querySelector("a.preview-btn")) return;

                    //copier le bouton sélectioner dans l'élément parent
                    let element = document.createElement("a");
                    element.href = el.href;
                    element.className = "preview-btn";
                    element.target = "_blank";
                    element.innerHTML = `<i class="material-icons">visibility</i>`;
                    element.style.marginRight = "8px";
                    el.parentNode.parentNode.appendChild(element);
                });
            }

            if (data.toggle_catalog_ungroup_action) {
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
            }

            if (data.toggle_catalog_masquer_horsTaxe) {
                console.log("🔄 Masquage hors taxe du catalogue");
                document.querySelectorAll("[data-column-id='final_price_tax_excluded']").forEach((el) => {
                    el.style.display = "none";
                });
                const elements = document.querySelectorAll(".column-final_price_tax_excluded");
                elements.forEach((el) => {
                    el.style.display = "none";
                });
            }

            if (data.toggle_catalog_lbc_copy) {
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
                        chrome.storage.local.set({ "lbc_copy_data": dataCopy });
                        console.log("Donnée copiée : ", dataCopy);
                        navigator.clipboard.writeText(aicm);
                        boutonCopier.innerText = "✅LBC";
                        setTimeout(() => (boutonCopier.innerText = "📋LBC"), 1500);
                    });
                });
            }

            if (data.toggle_catalog_color_line) {
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

                // Fonction pour gérer la mise en surbrillance d'une ligne <tr>
                function handleRowHighlight(e) {
                    const tr = e.target.closest('tr'); // monte jusqu’au <tr> le plus proche
                    if (!tr || tr.matches('.column-headers, .column-filters')) return;  // on a cliqué ailleurs on ignore en‑têtes & filtres

                    // Retire la surbrillance éventuelle
                    const actif = document.querySelector(`.${HIGHLIGHT}`);
                    if (actif && actif !== tr) actif.classList.remove(HIGHLIGHT);

                    // Ajoute la surbrillance à la ligne cliquée
                    tr.classList.add(HIGHLIGHT);
                }

                // Délégation d’événements pour click et clic droit
                ['click', 'contextmenu'].forEach(evt =>
                    document.addEventListener(evt, handleRowHighlight)
                );
            }

            if (data.toggle_catalog_color_remplacement) {
                console.log("🔄 Remplacement du bleu ilisible");
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
            }

        });
    } catch (error) {
        console.error("Erreur lors de l'ajout des boutons/actions dans le catalogue :", error);
    }
}

function productActions() {
    const keys = [
        "toggle_product_rename_tabs",
        "toggle_product_subtitle_display",
        "toggle_product_preview_buttons",
        "toggle_product_ungroup_action",
        "toggle_product_focus_auto",
        "toggle_product_taxe_ttc"
    ];
    chrome.storage.sync.get(keys, (data) => {
        if (data.toggle_product_rename_tabs) {
            const productName = document.getElementById('product_header_name_1').value;
            const productSubTitle = document.getElementById('product_description_subtitle').value || "";
            if (productName)
                document.title = "Modifier  « " + productName + " " + productSubTitle + " » | " + document.title; // Change le titre de la page pour le catalogue
            else
                document.title = "Modifier " + document.title; // Change le titre de la page pour le catalogue
        }

        if (data.toggle_product_subtitle_display) {
            console.log("🔄 Ajout du sous titre");

            updateSubtitleDisplay(); // Appel initial pour afficher le sous-titre si déjà présent
            const productSubTitle = document.getElementById('product_description_subtitle');
            if (productSubTitle) {
                productSubTitle.addEventListener('input', () => {
                    updateSubtitleDisplay();
                    console.log("🔄 Sous-titre mis à jour :", productSubTitle.value);
                });
            }

            function updateSubtitleDisplay() {
                const productSubTitle = document.getElementById('product_description_subtitle');
                if (!productSubTitle) return; // Ne rien faire
                // Supprimer l'ancien sous-titre s'il existe
                const oldSubtitle = document.getElementById("product_subtitle_display");
                if (oldSubtitle) {
                    oldSubtitle.textContent = productSubTitle.value;
                } else {
                    const span = document.createElement('span');
                    span.textContent = productSubTitle.value;
                    span.id = "product_subtitle_display";
                    span.style.color = "#888";
                    document.querySelector('#product_header > div').appendChild(span);
                }
            }
        }

        if (data.toggle_product_preview_buttons) {
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
        }

        if (data.toggle_product_ungroup_action) {
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
        }

        if (data.toggle_product_focus_auto) {
            console.log("🔄 Activation du focus automatique");
            const select = document.querySelector('#product_description_manufacturer'); // Récupère le <select>
            if (select && select.nextElementSibling) {
                select.nextElementSibling.addEventListener('click', () => {
                    const input = document.querySelector('.select2-search__field[aria-controls="select2-product_description_manufacturer-results"]');
                    if (input) input.focus();
                });
            }
            const attributSelect = document.querySelectorAll('[id^="product_details_features_feature_values"]');
            attributSelect.forEach((select) => {
                select.addEventListener('click', () => {
                    const input = document.querySelector('.select2-search__field[aria-controls^="select2-product_details_features_feature_values_"]');
                    if (input) input.focus();
                });
            });
        }

        if (data.toggle_product_taxe_ttc) {
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
        }


    });

    chrome.storage.sync.get(["toggle_product_remise_calcul", "toggle_product_heureFin", "toggle_product_heureDebut"], (data) => {
        if (!data.toggle_product_remise_calcul && !data.toggle_product_heureFin && !data.toggle_product_heureDebut) return;

        const prixBaseInputTTC = document.querySelector("#product_pricing_retail_price_price_tax_included");
        const prixBaseTTC = parseFloat(prixBaseInputTTC?.value.replace(',', '.'));
        if (isNaN(prixBaseTTC)) return;
        console.log("🔄 Prix de base TTC :", prixBaseTTC);

        const prixBaseInputHT = document.querySelector("#product_pricing_retail_price_price_tax_excluded");
        const prixBaseHT = parseFloat(prixBaseInputHT?.value.replace(',', '.'));
        if (isNaN(prixBaseHT)) return;
        console.log("🔄 Prix de base HT :", prixBaseHT);

        let combinations = [];
        if (document.getElementById('product_combinations-tab-nav')) {
            const url = new URL(window.location.href);
            const pathnameParts = url.pathname.split("/");
            const productId = pathnameParts.includes("products-v2") ? pathnameParts[pathnameParts.indexOf("products-v2") + 1] : null;
            const token = url.searchParams.get("_token");
            // console.log("🔄 DEMA NDE DE Chargement des déclinaisons depuis l'API ", productId);
            getCombinations(productId, token, prixBaseTTC, prixBaseHT, (liste) => {
                combinations = liste;
            });
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(({ addedNodes }) => {
                addedNodes.forEach((node) => {
                    if (node.nodeType !== 1 || node.id !== "modal-specific-price-form") return;
                    console.log("✅ Popup détecté !");

                    const iframe = node.querySelector("iframe");
                    if (!iframe) return console.log("⚠️ Pas d'iframe trouvé");

                    iframe.addEventListener("load", () => {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        if (!iframeDoc) return;
                        console.log("✅ Iframe chargé !");

                        if (data.toggle_product_remise_calcul) {
                            ajouterChampPrixApresRemise(iframeDoc, prixBaseTTC);
                            afficherPrixDeclinaison(iframeDoc, combinations);
                        }

                        if (data.toggle_product_heureFin) {
                            fixerHeureFinPromo(iframeDoc);
                        }

                        if (data.toggle_product_heureDebut) {
                            fixerHeureDebutPromo(iframeDoc);
                        }
                    });
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        function getDeclinaisonSelectionnee(doc, combinations) {
            const label = doc.querySelector('#select2-specific_price_combination_id-container')?.getAttribute('title')?.trim();
            return combinations.find(c => c.name === label);
        }

        function ajouterChampPrixApresRemise(doc, prixBaseTTC) {
            const remise = doc.querySelector('#specific_price_impact_reduction_value');
            const divPrix = doc.querySelector('#specific_price_impact_reduction');
            if (!remise || !divPrix) return console.log('❌ div remise introuvable dans iframe');

            console.log("🎯 div remise trouvée : ajout de l'input");
            const inputPrixApresRemise = document.createElement('input');
            inputPrixApresRemise.id = 'custom_input_prix_apres_remise';
            inputPrixApresRemise.type = 'text';
            inputPrixApresRemise.placeholder = 'Prix après remise TTC';
            inputPrixApresRemise.title = `Calcul auto : [Prix TTC de l'article] - [cette zone] = [remise dans la case à coté]  // Attention aux produits variable`;
            inputPrixApresRemise.style.cssText = 'width: 155px !important; margin-left: 20px;';
            inputPrixApresRemise.addEventListener('input', () => {
                const prixApresRemise = parseFloat(inputPrixApresRemise.value);
                let prixDeReference = prixBaseTTC;

                const found = getDeclinaisonSelectionnee(doc, combinations);
                if (found) prixDeReference = found.calcul_prix_ttc_final;

                if (!isNaN(prixApresRemise)) {
                    remise.value = (prixDeReference - prixApresRemise).toFixed(2);
                }
            });
            divPrix.prepend(inputPrixApresRemise);
        }

        function afficherPrixDeclinaison(doc, combinations) {
            const decliSelect = doc.querySelector('#specific_price_combination_id');
            if (!decliSelect) return;

            const spanPrixDecli = document.createElement('span');
            spanPrixDecli.style.marginLeft = "10px";
            decliSelect.parentElement.appendChild(spanPrixDecli);

            const getLabelText = () => {
                const container = doc.querySelector('#select2-specific_price_combination_id-container');
                return container?.getAttribute('title')?.trim();
            };

            const updateDisplay = () => {
                const selectedLabel = getLabelText();
                if (!selectedLabel) return;
                const found = combinations.find(c => c.name === selectedLabel);

                if (found) {
                    spanPrixDecli.textContent = `Prix final TTC : ${found.calcul_prix_ttc_final.toFixed(2)} €`;
                } else {
                    spanPrixDecli.textContent = "Prix non dispo pour cette sélection";
                }
            };

            // Initial check
            updateDisplay();

            // Mutation observer for changes in select2 label
            const labelObserver = new MutationObserver(() => updateDisplay());
            const labelContainer = doc.querySelector('#select2-specific_price_combination_id-container');
            if (labelContainer) {
                labelObserver.observe(labelContainer, { childList: true, subtree: true, characterData: true });
            }

            // Listen to change on the actual <select> as well (fallback)
            decliSelect.addEventListener('change', updateDisplay);
        }

        function fixerHeureFinPromo(doc) {
            const divDateFin = doc.querySelector('div.input-group.date-range.row>div:last-child');
            const checkbox = doc.querySelector('#specific_price_date_range_unlimited');
            const inputDateFin = doc.querySelector('#specific_price_date_range_to');
            if (!divDateFin || !checkbox || !inputDateFin) return;

            divDateFin.style.marginLeft = "100px";
            checkbox.addEventListener('change', () => {
                if (!checkbox.checked) {
                    let dateValue = inputDateFin.getAttribute('data-default-value')?.split(' ')[0];
                    if (!dateValue) return;

                    const newDateTime = `${dateValue} 23:59:59`;
                    inputDateFin.value = newDateTime;
                    inputDateFin.dispatchEvent(new Event('input', { bubbles: true }));
                    inputDateFin.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }

        function fixerHeureDebutPromo(doc) {
            const divDateDebut = doc.querySelector('div.input-group.date-range.row>div:first-child');
            const inputDateDebut = doc.querySelector('#specific_price_date_range_from');
            if (!divDateDebut || !inputDateDebut) return;

            inputDateDebut.addEventListener('click', () => {
                let dateValue = inputDateDebut.value?.split(' ')[0];
                console.log("🔄 Date de début :", inputDateDebut.value);
                if (!dateValue) return;
                if (dateValue.includes('00:00:00')) return; // Si déjà formaté, ne rien faire

                // Si l'heure et la minute actuelles, on remplace par 00:00:00
                if (inputDateDebut.value && inputDateDebut.value.split(' ')[1]) {
                    const heureMinute = inputDateDebut.value.split(' ')[1].slice(0, 5); // "HH:MM"
                    const now = new Date();
                    const nowStr = now.toTimeString().slice(0, 5); // "HH:MM"
                    if (heureMinute === nowStr) {
                        // On remplace par 00:00:00
                        inputDateDebut.value = `${dateValue} 00:00:00`;
                        inputDateDebut.dispatchEvent(new Event('input', { bubbles: true }));
                        inputDateDebut.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        }
    });

    chrome.storage.sync.get("toggle_product_stock_display", (data) => {
        if (!data.toggle_product_stock_display) return; // Ne rien faire si désactivé

        // Attendre que la zone existe
        function waitForZone(cb) {
            const zone = document.querySelector('#prestatillstockperstore');
            if (zone) return cb(zone);
            const waiter = new MutationObserver(() => {
                const found = document.querySelector('#prestatillstockperstore');
                if (found) {
                    waiter.disconnect();
                    cb(found);
                }
            });
            waiter.observe(document.body, { childList: true, subtree: true });
        }
        // Lance l'observation dès que la zone est présente
        waitForZone((zone) => {
            console.log('🔍 Surveillance activée sur #prestatillstockperstore');
            let debounceTimer = null;
            const observer = new MutationObserver((mutations) => {
                const hasRealChange = mutations.some(
                    m => m.type === 'childList' &&
                        (m.addedNodes.length || m.removedNodes.length)
                );
                if (!hasRealChange) return;

                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    console.log('♻️ Rechargement détecté !');
                    observer.disconnect(); // TEMPORAIREMENT suspendre l’observation

                    const selectMagasin = document.querySelector('#sbs_store_list');
                    if (selectMagasin) {
                        selectMagasin.disabled = true;
                    }

                    // const coloneGauche = document.getElementById('store_list');
                    // if (coloneGauche) {
                    //     coloneGauche.style.display = "none";
                    // }

                    document.querySelectorAll('.sbs_table_box').forEach((el) => {
                        el.classList.add('active');
                        // el.style.paddingBottom = "40px";
                        el.style.marginBottom = "40px";
                        // el.style.borderBottom = "solid black 2px";
                        el.style.border = "solid black 1px";
                        el.style.padding = "20px";
                        el.style.backgroundColor = "#ffc99413";
                        el.style.borderRadius = "10px";
                    });

                    document.querySelectorAll('.shortcuts .affect_quantities').forEach((el) => {
                        el.classList.add('disabled'); // désactive les boutons car ne fonctionne pas quand les 3 stocks sont affichés
                    });

                    observer.observe(zone, { childList: true, subtree: true }); // réactives l’observer
                }, 100);
            });
            observer.observe(zone, { childList: true, subtree: true });
        });
    });
}

//////////////////////////

function getCombinations(productId, token, prixBaseTTC, prixBaseHT, callback) {
    if (!productId || !token) {
        console.warn("❌ Impossible de détecter l'ID produit ou le token.");
        return;
    }

    const shopId = 1;
    const apiUrl = `${location.origin}/logcncin/index.php/sell/catalog/products-v2/${productId}/combinations?shopId=${shopId}&product_combinations_${productId}[offset]=0&product_combinations_${productId}[limit]=100&_token=${token}`;

    fetch(apiUrl, { credentials: "same-origin" })
        .then(response => response.json())
        .then(data => {
            if (!data.combinations || !Array.isArray(data.combinations)) {
                console.warn("❌ Format de données inattendu :", data);
                return;
            }
            // console.log("📦 DATA Déclinaisons récupérées via API :", data);

            const liste = data.combinations.map(c => {
                const impact = parseFloat(c.impact_on_price_te.replace(',', '.'));
                return {
                    id: c.combination_id,
                    name: c.name,
                    ref: c.reference,
                    quantity: c.quantity,
                    impact_price_ht: impact,
                    calcul_prix_ttc_final: prixBaseTTC + (impact * 1.2),
                    calcul_prix_ttc_TEST: (prixBaseHT + impact) * 1.2
                };
            });

            console.log("📦 Déclinaisons récupérées via API :", liste);
            if (typeof callback === "function") callback(liste);
        })
        .catch(err => {
            console.error(`[${new Date().toLocaleString()}] ❌ Erreur lors du chargement des déclinaisons :`, err);
            if (typeof callback === "function") callback([]);
        });
}