console.log("✅ Script injecté !  content-admin-catalog.js");

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
            "catalog_color_remplacement_default",
            "toggle_catalog_shift_selection"
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

                            if (liste.length != 0) {
                                const link = el.querySelector("a");
                                const [baseUrl] = link.href.split("#"); // récupère tout avant le #
                                link.href = `${baseUrl}#tab-product_combinations-tab`;
                            }

                            // if (refsConcatenees) {
                            //     el.style.maxWidth = "200px";
                            //     if (el.innerText.includes("Aucun code AICM") || el.innerText.includes("Déclinaisons ?"))
                            //         el.querySelector("a").innerText = "";
                            //     const lienDeclinaisons = document.createElement('a');
                            //     lienDeclinaisons.href = `${el.querySelector("a").href.split("#")}#tab-product_combinations-tab`;
                            //     lienDeclinaisons.innerText = `${!el.innerText ? '' : '\n'}${liste.length} Déclinaisons :\n`;
                            //     lienDeclinaisons.style.color = "#c90000";
                            //     el.appendChild(lienDeclinaisons);
                            //     const elem = document.createElement('span');
                            //     elem.style.cssText = 'white-space: normal !important;';
                            //     elem.innerText = refsConcatenees;
                            //     el.appendChild(elem);
                            // } else if (liste.length != 0) {
                            //     el.querySelector("a").innerText = `${liste.length} Déclinaisons :\nAucun code AICM`;
                            //     el.querySelector("a").setAttribute("style", "color: #c90000 !important");
                            // }

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
                    bouton.title = "Copier le nom du produit";
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

            if (data.toggle_catalog_shift_selection) {
                let lastCheckedIndex = null;
                const checkboxes = Array.from(document.querySelectorAll(".js-bulk-action-checkbox"));
                checkboxes.forEach((checkbox, index) => {
                    // On intercepte le clic sur le label
                    const label = checkbox.closest("label");
                    if (label) {
                        label.addEventListener("click", function (e) {
                            // Si shift + clic
                            if (e.shiftKey && lastCheckedIndex !== null) {
                                e.preventDefault(); // empêcher comportement natif
                                const currentIndex = index;
                                const [start, end] = [lastCheckedIndex, currentIndex].sort((a, b) => a - b);
                                for (let i = start; i <= end; i++) {
                                    checkboxes[i].checked = true;
                                }
                            }
                            lastCheckedIndex = index;
                        });
                    }
                });
                const style = document.createElement("style");
                style.textContent = `
                    .no-text-select {
                    user-select: none !important;
                    }
                `;
                document.head.appendChild(style);
                const table = document.querySelector("#product_grid_table");
                if (table) {
                    document.addEventListener("keydown", (e) => {
                        if (e.key === "Shift") table.classList.add("no-text-select");
                    });
                    document.addEventListener("keyup", (e) => {
                        if (e.key === "Shift") table.classList.remove("no-text-select");
                    });
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
        "toggle_product_taxe_ttc",
        "toggle_product_auto_occasion",
        "toggle_product_preset_specs",
        "toggle_product_delete_specs",
        "toggle_product_delete_empty_specs",
        "toggle_product_image_selection",
        "toggle_product_smart_category",
        "toggle_product_specificPrices_color",
        "toggle_product_insertSeoTitleButton",
        "toggle_product_cleanEditorNote",
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
            console.log("🔄 Ajout du bouton de prévisu custom");

            const elements = document.querySelectorAll("#product_footer_actions_preview");
            elements.forEach((el) => {
                //copier le bouton sélectioner dans l'élément parent
                let element = document.createElement("a");
                element.href = el.href;
                element.target = "_blank";
                element.title = "Prévisualiser";
                // element.title = "Prévisualiser ➔ Clic droit pour ouvrir dans un nouvel onglet";
                element.innerHTML = `<i class="material-icons">visibility</i>`;
                element.style.margin = "0 10px";
                element.style.padding = "3px";
                el.parentNode.parentNode.appendChild(element);

                // // Ouvre dans un nouvel onglet si clic droit
                // element.addEventListener("contextmenu", (e) => {
                //     e.preventDefault();
                //     window.open(element.href, "_blank");
                // });
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

        if (data.toggle_product_auto_occasion) {
            const html = document.getElementById("product_description_categories_product_categories").innerText;
            const contientOccasion = /occasion(s)?/i.test(html);

            if (contientOccasion && document.querySelector('#product_details_show_condition_1')?.checked === false) {
                console.log("➡️ La catégorie contient 'Occasion'");
                document.querySelector('#product_details_show_condition_1')?.click();
                document.querySelector('#product_details_condition').value = 'used';
                document.querySelector('#product_details_condition').dispatchEvent(new Event('input', { bubbles: true }));
                displayNotif("✅ État 'Occasion' activé automatiquement");
                console.log("✅ État 'Occasion' activé automatiquement");
            } else {
                console.log("➡️ La catégorie ne contient pas 'Occasion' ou l'état est déjà activé");
            }
        }

        if (data.toggle_product_preset_specs) {
            const placeholderText = "NE RIEN ÉCRIRE ICI";
            const specsTemplate = [
                {
                    type: "Appareil photo",
                    specs: [
                        { spec: "Format de Capteur", value: "", placeholder: "NE RIEN ÉCRIRE ICI" },
                        { spec: "Détails Capteur", value: "" },
                        { spec: "Stabilisation du Capteur", value: "" },
                        { spec: "Millions pixels", value: "" },
                        { spec: "Processeur d'image", value: "" },
                        { spec: "Stockage", value: "", placeholder: "type de carte mémoire" },
                        { spec: "Stockage interne", value: "", placeholder: "Si mémoire interne / en Go" },
                        { spec: "Connectivité", value: "Bluetooth, Wi-Fi", placeholder: "Bluetooth, Wi-Fi, NFC ..." },
                        { spec: "Prises", value: "", placeholder: "USB-C, Jack, HDMI ..." },
                        { spec: "Détails Écran", value: "" },
                        { spec: "Ecran orientable", value: "", placeholder: "NE RIEN ÉCRIRE ICI" },
                        { spec: "Viseur", value: "" },
                        { spec: "Vidéo", value: "" },
                        { spec: "Dimensions (LxHxP)", value: "" },
                        { spec: "Poids", value: "" },
                        { spec: "Accessoires fournis", value: "" },
                    ]
                },
                {
                    type: "Objectif",
                    specs: [
                        { spec: "Compatibilité Objectif", value: "", placeholder: "NE RIEN ÉCRIRE ICI" },
                        { spec: "Ouverture maximale f/", value: "", placeholder: "NE RIEN ÉCRIRE ICI" },
                        { spec: "Diamètre du filtre", value: "", placeholder: "NE RIEN ÉCRIRE ICI" },
                        { spec: "Distance minimale de mise au point", value: "" },
                        { spec: "Nombre de lamelles du diaphragme", value: "" },
                        { spec: "Diamètre x longueur", value: "" },
                        { spec: "Poids", value: "" },
                        { spec: "Accessoires fournis", value: "" },
                    ]
                },
                {
                    type: "Objectif +",
                    name: "Obj+",
                    specs: [
                        { spec: "Stabilisation de l'objectif", value: "" },
                        { spec: "Moteur AF", value: "" },
                        { spec: "Zoom Motorisé", value: "", placeholder: "NE RIEN ÉCRIRE ICI" },
                        { spec: "Zoom Interne", value: "", placeholder: "NE RIEN ÉCRIRE ICI" },
                    ]
                },
                {
                    type: "Trépied",
                    specs: [
                        { spec: "Nombre de sections", value: "" },
                        { spec: "Hauteur maximum", value: "" },
                        { spec: "Hauteur minimum", value: "" },
                        { spec: "Charge maximum", value: "" },
                        { spec: "Longueur plié", value: "" },
                        { spec: "Poids", value: "" },
                        { spec: "Matériau", value: "" },
                        // { spec: "Niveau à bulle", value: "" },
                        // { spec: "Accessoires fournis", value: "" },
                    ]
                },
                {
                    type: "Carte mémoire",
                    specs: [
                        { spec: "Type de carte", value: "", placeholder: "NE RIEN ÉCRIRE ICI" },
                        { spec: "Vitesse d'écriture", value: "" },
                        { spec: "Vitesse de lecture", value: "" },
                        { spec: "Poids", value: "" },
                    ]
                },
                {
                    type: "Sac",
                    specs: [
                        { spec: "Dimensions (LxHxP)", value: "" },
                        { spec: "Dimensions internes (LxHxP)", value: "" },
                        { spec: "Poids", value: "" },
                    ]
                },
                {
                    type: "Occasion",
                    specs: [
                        { spec: "État (Occasion)", value: "", placeholder: "NE RIEN ÉCRIRE ICI", valuePreset: "Bon état" },
                        { spec: "Magasin (Occasion)", value: "", placeholder: "NE RIEN ÉCRIRE ICI" },
                    ]
                },
                {
                    type: "Occasion",
                    name: "OC+",
                    specs: [
                        { spec: "Monture d'objectif", value: "", placeholder: "NE RIEN ÉCRIRE ICI" },
                        { spec: "Accessoires fournis", value: "" },
                    ]
                },
                {
                    type: "Appareil APS-C",
                    name: "Capteur APS-C",
                    specs: [
                        { spec: "Format de Capteur", value: "", placeholder: "NE RIEN ÉCRIRE ICI", valuePreset: "APS-C" },
                    ]
                },
                {
                    type: "Appareil Plein Format",
                    name: "Capteur FF",
                    specs: [
                        { spec: "Format de Capteur", value: "", placeholder: "NE RIEN ÉCRIRE ICI", valuePreset: "Plein format" },
                    ]
                },
            ];

            const buttonAddSpecs = document.getElementById('product_details_features_add_feature');

            const br = document.createElement("br")
            buttonAddSpecs.parentNode.appendChild(br);

            specsTemplate.forEach(template => {
                const btn = document.createElement('button');
                btn.type = "button"; // ← Empêche le submit
                btn.textContent = template.name || `Preset ${template.type}`;
                btn.className = 'btn btn-sm btn-outline-primary ml-2';
                btn.style.marginLeft = "10px";
                btn.style.marginTop = "10px";
                btn.addEventListener('click', () => applyPreset(template.specs));
                // buttonAddSpecs.parentNode.insertBefore(btn, buttonAddSpecs.nextSibling);
                buttonAddSpecs.parentNode.appendChild(btn);
            });

            function applyPreset(specsList) {
                const delay = 100;

                // Obtenir les caractéristiques déjà utilisées
                const existingFeatures = Array.from(document.querySelectorAll('.product-feature select.feature-selector'))
                    .map(select => select.options[select.selectedIndex]?.textContent?.trim().toLowerCase())
                    .filter(Boolean);

                specsList.forEach((spec, index) => {
                    if (existingFeatures.includes(spec.spec.toLowerCase())) {
                        console.log(`Caractéristique déjà présente : ${spec.spec}, ignorée.`);
                        displayNotif(`⚠️ Caractéristique déjà présente : ${spec.spec}, ignorée.`);
                        return;
                    }

                    setTimeout(() => {
                        // 1. Clic sur "ajouter"
                        document.getElementById('product_details_features_add_feature').click();

                        // 2. Attente courte, puis remplissage
                        setTimeout(() => {
                            const featureBlocks = document.querySelectorAll('.product-feature');
                            const lastBlock = featureBlocks[featureBlocks.length - 1];

                            // 3. Remplissage du champ "Caractéristique"
                            const selectFeature = lastBlock.querySelector('.feature-selector');
                            if (selectFeature) {
                                const matchingOption = [...selectFeature.options].find(opt => opt.textContent.trim().toLowerCase() === spec.spec.toLowerCase());
                                if (matchingOption) {
                                    selectFeature.value = matchingOption.value;
                                    selectFeature.dispatchEvent(new Event('change', { bubbles: true }));
                                } else {
                                    console.warn(`[${new Date().toLocaleString()}] Caractéristique introuvable : ${spec.spec}`);
                                    displayNotif(`⚠️ Caractéristique introuvable : ${spec.spec}`);
                                }
                            }
                            setTimeout(() => {
                                const selectValue = lastBlock.querySelector('.feature-value-selector');
                                if (selectValue && spec.valuePreset) {
                                    const matchingOption = [...selectValue.options].find(opt => normalize(opt.textContent) === normalize(spec.valuePreset));
                                    if (matchingOption) {
                                        selectValue.value = matchingOption.value;
                                        selectValue.dispatchEvent(new Event('change', { bubbles: true }));
                                    } else {
                                        console.warn(`[${new Date().toLocaleString()}] Valeur introuvable : ${spec.valuePreset}`);
                                        displayNotif(`⚠️ Valeur introuvable pour "${spec.spec}" : ${spec.valuePreset}`);
                                    }
                                }
                            }, 500);

                            // 4. Remplissage de la valeur personnalisée
                            const input = lastBlock.querySelector('input[type="text"]');
                            if (input) {
                                input.value = spec.value;
                                input.placeholder = spec.placeholder || "";
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }, 50);
                    }, delay * index);
                });
            }

            //////// PARTIE DYNAMIQUE APRÈS SÉLECTION (ajout des placeholder lors de l'ajout manuel) ////////
            // Observer l’ajout de nouvelles lignes
            const container = document.getElementById("product_details_features_feature_values");

            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType !== 1) return;

                        // Si le node lui-même est une product-feature
                        if (node.classList.contains("product-feature")) {
                            initFeatureRow(node);
                        }
                        // Sinon, chercher les .product-feature à l’intérieur
                        node.querySelectorAll?.(".product-feature").forEach(initFeatureRow);
                    });
                });
            });

            observer.observe(container, { childList: true, subtree: true });

            // Initialiser aussi les lignes déjà présentes
            document.querySelectorAll("#product_details_features_feature_values .product-feature").forEach(initFeatureRow);

            function initFeatureRow(row) {
                console.log("🔄 Initialisation d'une ligne de caractéristique", row);
                const select = row.querySelector(".feature-selector");
                if (!select) {
                    console.log("⚠️ Aucun select trouvé dans la ligne", row);
                    return;
                }

                function applyFromSelect() {
                    const selectedText = select.options[select.selectedIndex]?.textContent.trim();
                    // console.log("🔄 Vérification via applyFromSelect :", selectedText);

                    if (!selectedText || selectedText === "Choisissez une caractéristique") {
                        // console.log("⚠️ Aucun texte valide sélectionné :", selectedText);
                        return;
                    }

                    let foundSpec = null;
                    specsTemplate.some(template =>
                        template.specs.some(spec => {
                            if (spec.spec.toLowerCase() === selectedText.toLowerCase()) {
                                foundSpec = spec;
                                return true;
                            }
                            return false;
                        })
                    );

                    if (foundSpec) {
                        // console.log("✅ Valeur trouvée dans specsTemplate :", foundSpec);
                        const input = row.querySelector('input[type="text"]');
                        if (input) {
                            if (foundSpec.placeholder) {
                                input.placeholder = foundSpec.placeholder;
                                // console.log("✍️ Placeholder appliqué :", foundSpec.placeholder);
                            }
                            // if (foundSpec.value) {
                            //     input.value = foundSpec.value;
                            //     // console.log("✍️ Valeur appliquée :", foundSpec.value);
                            // }
                            // input.dispatchEvent(new Event("input", { bubbles: true }));
                        }
                    } else {
                        console.log("❌ Aucune correspondance trouvée dans specsTemplate pour :", selectedText);
                    }
                }

                // Appliquer immédiatement
                applyFromSelect();

                // 🔎 Trouver le conteneur Select2
                const rendered = row.querySelector(".select2-selection__rendered");
                if (rendered) {
                    const mo = new MutationObserver(mutations => {
                        mutations.forEach(m => {
                            if (m.type === "childList" || m.type === "characterData") {
                                // console.log("📡 Texte Select2 modifié :", rendered.textContent.trim());
                                applyFromSelect();
                            }
                        });
                    });
                    mo.observe(rendered, { childList: true, characterData: true, subtree: true });
                    // console.log("🔗 MutationObserver attaché sur .select2-selection__rendered");
                }
            }
        }

        if (data.toggle_product_delete_empty_specs) {
            // Bouton pour supprimer les caractéristiques vides
            const deleteEmptyBtn = document.createElement('button');
            deleteEmptyBtn.type = 'button';
            deleteEmptyBtn.textContent = '🗑 Suppr caractéristiques vides';
            deleteEmptyBtn.className = 'btn btn-warning ml-2';
            deleteEmptyBtn.style.marginLeft = '10px';
            deleteEmptyBtn.addEventListener('click', () => {
                const confirmed = window.confirm("⚠️ Cette action va supprimer toutes les caractéristiques vides. Voulez-vous continuer ?");
                if (confirmed) deleteEmptyFeatures();
            });
            const target = document.getElementById('product_details_features_add_feature');
            target.parentNode.insertBefore(deleteEmptyBtn, target.nextSibling);

            function deleteEmptyFeatures() {
                const featureRows = Array.from(document.querySelectorAll('.product-feature'));
                const rowsToDelete = featureRows.filter(row => {
                    const select = row.querySelector('.feature-value-selector');
                    const selectVal = select?.options?.[select.selectedIndex]?.value || select?.value || '';
                    const hasPredefined = selectVal.trim() && selectVal !== '0';
                    const hasCustom = Array.from(row.querySelectorAll('.custom-values input[type="text"]'))
                        .some(inp => inp.value.trim());
                    return !hasPredefined && !hasCustom;
                });
                if (!rowsToDelete.length) {
                    displayNotif("✅ Aucune caractéristique à supprimer.");
                    return;
                }
                rowsToDelete.forEach(row => {
                    Array.from(row.querySelectorAll('select, input')).forEach(el => {
                        ['change', 'input'].forEach(type => el.dispatchEvent(new Event(type, { bubbles: true })));

                    }); row.remove(); // supprime la ligne du DOM
                });
                displayNotif(`✅ ${rowsToDelete.length} lignes vides supprimées`);
            }
        }

        if (data.toggle_product_delete_specs) {
            // Bouton pour supprimer toutes les caractéristiques
            const deleteAllBtn = document.createElement('button');
            deleteAllBtn.type = 'button';
            deleteAllBtn.textContent = '🗑 Supprimer toutes les caractéristiques';
            deleteAllBtn.className = 'btn btn-danger ml-2';
            deleteAllBtn.style.marginLeft = '10px';
            deleteAllBtn.addEventListener('click', () => {
                const confirmed = window.confirm("⚠️ Cette action va supprimer toutes les caractéristiques. Voulez-vous continuer ?");
                if (confirmed) deleteAllFeatures();
            });
            const target = document.getElementById('product_details_features_add_feature');
            target.parentNode.insertBefore(deleteAllBtn, target.nextSibling);
            function deleteAllFeatures() {
                document.querySelectorAll('.product-feature').forEach(row => {
                    Array.from(row.querySelectorAll('select, input')).forEach(el => {
                        ['change', 'input'].forEach(type => el.dispatchEvent(new Event(type, { bubbles: true })));

                    }); row.remove(); // supprime la ligne du DOM
                });
            }
        }

        if (data.toggle_product_image_selection) {
            const container = document.querySelector("#product-images-container");
            if (!container) return;

            let hasHandled = false;
            let timeoutId = null;

            const observer = new MutationObserver(mutations => {
                if (hasHandled) return;

                // Si une image est ajoutée, on programme l'exécution unique après un court délai
                const imageAdded = mutations.some(mutation =>
                    [...mutation.addedNodes].some(node =>
                        node.nodeType === 1 && node.matches(".dz-preview")
                    )
                );

                if (imageAdded) {
                    if (timeoutId) clearTimeout(timeoutId); // reset le timer s'il y en avait un
                    timeoutId = setTimeout(() => {
                        if (hasHandled) return;
                        hasHandled = true;
                        observer.disconnect();
                        // console.log("🔄 Exécution unique de la logique après ajout des images");

                        const previews = document.querySelectorAll('.dz-preview.dz-complete');
                        // console.log('➡️ Les images : ', previews);

                        let isInternalClick = false;
                        previews.forEach(prev => {
                            // console.log("🔄 Image détectée : ", prev);
                            prev.addEventListener('click', (e) => {
                                if (isInternalClick) return; // ⛔ ignore si clic programmatique

                                const isCtrlPressed = e.ctrlKey || e.metaKey;
                                console.log('CTRL :', isCtrlPressed);
                                if (!isCtrlPressed) {
                                    isInternalClick = true; // ✅ bloquer récursion
                                    previews.forEach(prev2 => {
                                        if (prev !== prev2 && prev2.querySelector('input[type="checkbox"]').checked) {
                                            prev2.click();
                                        }
                                    });
                                    isInternalClick = false; // ✅ on réactive après
                                }
                            });
                        });
                    }, 100); // ⏳ petit délai pour laisser les mutations s'accumuler
                }
            });
            observer.observe(container, { childList: true, subtree: true });
        }

        if (data.toggle_product_smart_category) {
            console.log("📂 Script catégories chargé");
            let lastClickedCategory = null;
            let isCtrlPressed = false;

            // Observer quand la modale catégories est ajoutée au DOM
            const observer = new MutationObserver(() => {
                const modal = document.querySelector("#categories-modal");
                if (modal && modal.style.display === "block" && !modal.dataset.init) {
                    console.log("✅ Modale catégories détectée");
                    modal.dataset.init = "true"; // ⚡ empêche la réinit multiple
                    initCategoryWatcher(modal);
                    // modal.querySelector('li.category-tree-element ul.children-list').classList.remove('d-none'); //test pour déplier le catégorie  accueil
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            function initCategoryWatcher(modal) {
                const checkboxes = modal.querySelectorAll(".tree-checkbox-input");
                checkboxes.forEach(checkbox => {
                    checkbox.addEventListener("click", function (e) {
                        if (this.checked) {
                            lastClickedCategory = this; // mémorise la dernière catégorie cochée
                            console.log("👆 Catégorie cochée par l’utilisateur :", this.value, this.parentElement?.textContent.trim());

                            isCtrlPressed = e.ctrlKey || e.metaKey;
                            console.log('CTRL :', isCtrlPressed);
                        }
                    });
                    checkbox.addEventListener("change", function () {
                        if (this.checked) {
                            checkParents(this);
                        }
                    });
                });
                // 🎯 Quand on clique sur "Enregistrer"
                const applyBtn = modal.querySelector("#category_tree_selector_apply_btn");
                if (applyBtn) {
                    applyBtn.addEventListener("click", () => {
                        if (lastClickedCategory) {
                            setDefaultCategory(lastClickedCategory);
                        }
                    });
                }
                console.log("👀 Surveillance des catégories activée");
            }

            function checkParents(checkbox) {
                // On remonte les <li> parents
                let li = checkbox.closest("li.category-tree-element");
                while (li) {
                    const parentUl = li.closest("ul.children-list");
                    if (!parentUl) break; // plus de parent
                    const parentLi = parentUl.closest("li.category-tree-element");
                    if (!parentLi) break;

                    // ✅ On récupère directement le premier input de ce parent
                    const parentCheckbox = parentLi.querySelector("input.tree-checkbox-input");
                    if (parentCheckbox && !parentCheckbox.checked) {
                        // On ignore la catégorie "Accueil"
                        const label = parentLi.querySelector("label");
                        if ((!label || !label.textContent.trim().toLowerCase().includes("accueil")) && !isCtrlPressed) {
                            parentCheckbox.checked = true;
                            parentCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
                            console.log("✔️ Catégorie parente cochée :", label?.textContent.trim());
                        }
                    }
                    // Décocher automatiquement la catégorie "Accueil"
                    if (parentCheckbox && parentLi.querySelector("label").textContent.trim().toLowerCase().includes("accueil") && parentCheckbox.checked) {
                        parentCheckbox.checked = false;
                        parentCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
                        console.log("❌ Catégorie 'Accueil' décochée automatiquement");
                    }
                    li = parentLi;
                }
            }

            function setDefaultCategory(checkbox) {
                const select = document.querySelector("#product_description_categories_default_category_id");
                if (!select) return;

                const value = checkbox.value;
                const option = select.querySelector(`option[value="${value}"]`);
                if (option) {
                    select.value = value;
                    select.dispatchEvent(new Event("change", { bubbles: true }));
                    console.log("🌟 Catégorie par défaut définie :", option.textContent.trim());
                }
            }
        }

        if (data.toggle_product_specificPrices_color) {
            console.log("🎨 Script coloration promos injecté");

            // 🔹 Fonction qui colore les périodes
            function colorizePeriods() {
                const now = new Date();
                document.querySelectorAll("#specific-prices-list-table td.period").forEach(td => {
                    const fromText = td.querySelector(".from")?.textContent.trim() || "";
                    const toText = td.querySelector(".to")?.textContent.trim() || "";

                    let fromDate = null;
                    let toDate = null;
                    if (fromText && fromText.toLowerCase() !== "toujours") {
                        fromDate = new Date(fromText.replace(" ", "T"));
                    }
                    if (toText && toText.toLowerCase() !== "illimité") {
                        toDate = new Date(toText.replace(" ", "T"));
                    }

                    if (toDate && now > toDate) {
                        // déjà terminé
                        td.style.backgroundColor = "rgba(255, 0, 0, 0.3)";   // rouge
                    } else if (fromDate && now < fromDate) {
                        // pas encore commencé
                        td.style.backgroundColor = "rgba(0, 255, 0, 0.3)";   // vert
                    } else {
                        // en cours
                        td.style.backgroundColor = "rgba(255, 255, 0, 0.5)"; // jaune
                    }
                });
            }

            // 🔹 Ajout de la légende avant le tableau
            const table = document.querySelector("#specific-prices-list-table");
            if (table && !document.querySelector("#promo-legend")) {
                const legend = document.createElement("div");
                legend.id = "promo-legend";
                legend.style.margin = "10px 0";
                legend.style.fontWeight = "bold";
                legend.textContent = "🔴 Terminé | 🟡 En cours | 🟢 A venir";
                table.parentNode.insertBefore(legend, table);
            }

            // 🔹 MutationObserver pour recolorer quand le tableau change
            const targetNode = document.querySelector("#specific-price-list-container");
            if (targetNode) {
                const observer = new MutationObserver(() => {
                    colorizePeriods();
                });
                observer.observe(targetNode, { childList: true, subtree: true });
            }

            // Premier passage
            colorizePeriods();
        }

        if (data.toggle_product_insertSeoTitleButton) {
            console.log("🔄️ Script SEO title injecté");
            const container = document.querySelector("#product_seo_meta_title");
            if (!container || document.querySelector(".generate-seo-title-btn")) return;

            // Création du bouton
            const btn = document.createElement("button");
            btn.type = "button";
            btn.id = "CSP_tools-generate-seo-title-btn";
            btn.className = "btn btn-outline-secondary mt-1";
            btn.innerHTML = "Générer le Title : <i>[brand] [name] [subtitle] - [category] - Concept Store Photo</i>";

            // Insertion à la fin du bloc
            container.parentElement.appendChild(btn);

            // Action au clic
            btn.addEventListener("click", insertSeoTitle);

            const seoInput = document.querySelector("#product_seo_meta_title_1");
            function insertSeoTitle() {
                // Nom produit et sous-titre
                let name = document.querySelector("#product_header_name_1")?.value.trim() || "";
                const subtitle = document.querySelector("#product_description_subtitle")?.value.trim() || "";

                // Marque (span Select2 en priorité, sinon <select>)
                const brandSpan = document.querySelector("#select2-product_description_manufacturer-container");
                const brandSelect = document.querySelector("#product_description_manufacturer option:checked");
                let brand = brandSpan?.textContent.trim() || brandSelect?.textContent.trim() || "";
                if (brand == "Aucune marque") brand = "";

                // Catégorie (span Select2 en priorité, sinon <select>)
                const categorySpan = document.querySelector("#select2-product_description_categories_default_category_id-container");
                const categorySelect = document.querySelector("#product_description_categories_default_category_id option:checked");
                let category = categorySpan?.textContent.trim() || categorySelect?.textContent.trim() || "";
                if (category.includes(">")) category = category.split(">").pop().trim();

                // Construction du Title SEO
                if (brand && name) {
                    const words = name.split(" ");
                    const firstWord = (words[0] || "").toLowerCase();
                    if (brand.toLowerCase() === firstWord || brand.toLowerCase().slice(0, 4) === firstWord.slice(0, 4)) {
                        // Supprimer le premier mot du name
                        words.shift();
                        name = words.join(" ").trim();
                    }
                }
                const leftPart = [brand, name, subtitle].filter(Boolean).join(" ");
                const rightPart = [category, "Concept Store Photo"].filter(Boolean).join(" - ");
                const seoTitle = [leftPart, rightPart].filter(Boolean).join(" - ");

                // Insertion dans le champ SEO Title
                if (seoInput) {
                    seoInput.value = seoTitle;
                    displayNotif(`ℹ️ SEO Title : Nombre de caractères : ${seoTitle.length} (doit faire 60, max 100)`, 4000)

                    // Déclenchement des events pour compatibilité Presta
                    seoInput.dispatchEvent(new Event("input", { bubbles: true }));
                    seoInput.dispatchEvent(new Event("change", { bubbles: true }));
                }
            }
            if (seoInput && seoInput.value == "" && document.querySelector("#product_header_name_1")?.value) {
                insertSeoTitle();
                displayNotif("✅ SEO Title généré automatiquement (car vide)");
            }
        }

        if (data.toggle_product_cleanEditorNote) {
            const BTN_ID = "cs-clean-notes-btn";

            // Injection du bouton dans la toolbar
            function addButton(wrapper, iframe, textarea) {
                if (!wrapper || wrapper.dataset.cleanBtnInjected === "1") return;
                console.log("🖌️ cleanEditorNote : Injection bouton…");

                const container = wrapper.closest(".mce-tinymce");
                if (!container) return;

                // Cherche zone de toolbar
                let toolbar =
                    container.querySelector(".mce-container-body .mce-flow-layout") ||
                    container.querySelector(".mce-toolbar .mce-flow-layout") ||
                    container.querySelector(".mce-flow-layout") ||
                    container.querySelector(".mce-toolbar-grp");

                if (!toolbar) return;

                // Création du bouton (structure simplifiée mais conforme)
                const btnGroup = document.createElement("div");
                btnGroup.className = "mce-container mce-flow-layout-item mce-btn-group";
                btnGroup.innerHTML = `
                    <div class="mce-container-body">
                        <div class="mce-widget mce-btn" role="button" tabindex="-1">
                            <button type="button" class="mce-widget mce-btn" title="Supprimer les références [x]">
                                <span class="mce-txt">🧹 Nettoyer [x]</span>
                            </button>
                        </div>
                    </div>
                `;

                // Action
                btnGroup.querySelector("button").addEventListener("click", () => cleanNotes(iframe, textarea));

                // Ajout en fin de toolbar
                toolbar.appendChild(btnGroup);
                wrapper.dataset.cleanBtnInjected = "1";
                console.log("✅ cleanEditorNote : Bouton injecté.");
            }

            // Nettoyage du contenu
            function cleanNotes(iframe, textarea) {
                const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
                if (!doc?.body) return;

                let html = doc.body.innerHTML;
                // console.log("📄 cleanEditorNote : Avant nettoyage :", html.substring(0, 200) + "...");

                html = html
                    // <a><sup>[12]</sup></a> ou <a>[12]</a>
                    .replace(/<a[^>]*>(?:\s*<sup[^>]*>)?\s*\[\d+\]\s*(?:<\/sup>)?\s*<\/a>/gi, "")
                    // <sup>[12]</sup>
                    .replace(/<sup[^>]*>\s*\[\d+\]\s*<\/sup>/gi, "")
                    // [12] isolés avant ponctuation -> supprime sans espace
                    .replace(/\[\d+\](?=\s*[\.\,\;\:\!\?\)])+/g, "")
                    // [12] isolés ailleurs -> remplace par un espace
                    .replace(/\[\d+\]/g, " ")
                    // espaces multiples
                    .replace(/(?:\s|&nbsp;|\u00A0){2,}/g, " ");


                doc.body.innerHTML = html;
                if (textarea) {
                    textarea.value = html;
                    textarea.dispatchEvent(new Event("input", { bubbles: true }));
                    textarea.dispatchEvent(new Event("change", { bubbles: true }));
                }

                // console.log("📄 cleanEditorNote : Après nettoyage :", html.substring(0, 200) + "...");
                console.log("🧹 cleanEditorNote : Nettoyage terminé !");
            }

            // Scan des éditeurs TinyMCE
            function scanEditors() {
                document.querySelectorAll('iframe[id$="_ifr"]').forEach((iframe) => {
                    const wrapper = iframe.closest(".mce-tinymce, .mce-container");
                    const baseId = iframe.id.replace(/_ifr$/, "");
                    const textarea = document.getElementById(baseId);

                    if (wrapper) addButton(wrapper, iframe, textarea);

                    if (!iframe.dataset._csLoadBound) {
                        iframe.addEventListener("load", () => {
                            console.log("📥 cleanEditorNote : Iframe rechargée :", iframe.id);
                        });
                        iframe.dataset._csLoadBound = "1";
                    }
                });
            }

            console.log("🚀 Script de nettoyage TinyMCE lancé (cleanEditorNote)");
            scanEditors();

            // Observe le DOM (PrestaShop recharge dynamiquement)
            new MutationObserver(scanEditors).observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        }


    });

    ///// Partie POPUP "Prix spécifiques" (promos)
    chrome.storage.sync.get(["toggle_product_remise_calcul", "toggle_product_heureFin", "toggle_product_heureDebut", "toggle_product_datePromoHistorique"], (data) => {
        if (!data.toggle_product_remise_calcul && !data.toggle_product_heureFin && !data.toggle_product_heureDebut && !data.toggle_product_datePromoHistorique) return;

        const prixBaseInputTTC = document.querySelector("#product_pricing_retail_price_price_tax_included");
        let prixBaseTTC = parseFloat(prixBaseInputTTC?.value.replace(',', '.'));
        if (isNaN(prixBaseTTC)) return;
        console.log("🔄 Prix de base TTC :", prixBaseTTC);
        prixBaseInputTTC.addEventListener('change', () => {
            prixBaseTTC = parseFloat(prixBaseInputTTC.value.replace(',', '.'));
            if (isNaN(prixBaseTTC)) return;
            console.log("🔄 Prix de base TTC mis à jour :", prixBaseTTC);
        });

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
            // console.log("🔄 DEMANDE de Chargement des déclinaisons depuis l'API ", productId);
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

                        iframeDoc.querySelector('#select2-specific_price_combination_id-container')?.style.setProperty('min-width', '450px', 'important');
                        document.querySelector('#modal-specific-price-form .modal-dialog')?.style.setProperty('max-width', '1000px');

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
                        if (data.toggle_product_datePromoHistorique) {
                            datePromoHistorique(iframeDoc);
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
            inputPrixApresRemise.style.cssText = 'min-width: 155px !important; padding: 8px 16px';

            const divPrixApresRemise = doc.createElement('div');
            divPrixApresRemise.style.cssText = 'display: flex; flex-direction: column; align-items: flex-start; margin-left: 20px;';
            divPrixApresRemise.appendChild(inputPrixApresRemise);

            const label = doc.createElement('label');
            label.textContent = 'Prix après remise TTC';
            label.style.marginBottom = '4px';
            divPrixApresRemise.prepend(label);

            inputPrixApresRemise.addEventListener('input', () => {
                const prixApresRemise = parseFloat(inputPrixApresRemise.value);
                let prixDeReference = prixBaseTTC;

                const found = getDeclinaisonSelectionnee(doc, combinations);
                if (found) prixDeReference = found.calcul_prix_ttc_final;

                if (!isNaN(prixApresRemise)) {
                    remise.value = (prixDeReference - prixApresRemise).toFixed(2);
                }
                if (doc.querySelector('#specific_price_impact_disabling_switch_reduction_1')?.checked === false) {
                    console.log("➡️ Toggle remise détecté comme désactivé");
                    doc.querySelector('#specific_price_impact_disabling_switch_reduction_1')?.click();
                    doc.querySelector('#specific_price_impact_disabling_switch_reduction').dispatchEvent(new Event('input', { bubbles: true }));
                    displayNotif("✅ Toggle remise activé automatiquement");
                    console.log("✅ Toggle remise activé automatiquement");
                } else {
                    console.log("➡️ Toggle remise déjà activé OU non détecté");
                }
            });
            remise.addEventListener('input', () => {
                const valeurRemise = parseFloat(remise.value);
                let prixDeReference = prixBaseTTC;
                const found = getDeclinaisonSelectionnee(doc, combinations);
                if (found) prixDeReference = found.calcul_prix_ttc_final;
                if (!isNaN(valeurRemise)) {
                    inputPrixApresRemise.value = (prixDeReference - valeurRemise).toFixed(2);
                } else {
                    inputPrixApresRemise.value = '';
                }
            });
            divPrix.appendChild(divPrixApresRemise);
            divPrix.style.alignItems = 'flex-end';
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
                // console.log("🔄 Date de début :", inputDateDebut.value);
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

        function datePromoHistorique(doc) {
            const inputDateDebut = doc.querySelector('#specific_price_date_range_from');
            const inputDateFin = doc.querySelector('#specific_price_date_range_to');
            const h4Duree = doc.querySelector('div.date-range')?.parentElement?.querySelector('h4');
            const nbValeurMax = 4; // Nombre de presets max à garder

            if (!inputDateDebut || !inputDateFin || !h4Duree) {
                console.log("❌ Champs date ou <h4> Durée introuvables dans l'iframe");
                return;
            }

            // --- Injecter le CSS ---
            if (!doc.querySelector("#promo-history-style")) {
                const style = doc.createElement("style");
                style.id = "promo-history-style";
                style.textContent = `
                #promo_history_buttons {
                    margin: 10px 0;
                    border-radius: 5px;
                }
                #promo_history_buttons button {
                    margin-right: 5px;
                    white-space: pre-line; /* multi-ligne */
                }
                #preset-context-menu {
                    position: absolute;
                    background: white;
                    border: 1px solid #ccc;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    z-index: 9999;
                    padding: 5px 0;
                    min-width: 120px;
                    font-size: 14px;
                }
                #preset-context-menu div {
                    padding: 5px 10px;
                    cursor: pointer;
                }
                #preset-context-menu div:hover {
                    background: #f0f0f0;
                }
            `;
                doc.head.appendChild(style);
            }

            // --- Charger l'historique ---
            let history = JSON.parse(localStorage.getItem("promo_dates_history") || "[]");
            console.log("📥 Historique chargé :", history);

            // Conteneur boutons
            let container = doc.createElement("div");
            container.id = "promo_history_buttons";
            h4Duree.insertAdjacentElement("afterend", container);

            let info = doc.createElement("p");
            // info.textContent = `Sauvegarde jusqu'à ${nbValeurMax} valeurs, la plus récente écrase la plus ancienne | Clique droit pour renommer/supprimer`;
            info.textContent = `Sauvegarde jusqu'à ${nbValeurMax} valeurs| Clique droit pour renommer/supprimer`;
            info.style.margin = "0";
            h4Duree.insertAdjacentElement("afterend", info);

            function saveHistory(debut, fin, name) {
                if (!debut || !fin) return;
                // history = history.filter(h => !(h.debut === debut && h.fin === fin));
                const exists = history.find(h => h.debut === debut && h.fin === fin);
                if (exists) {
                    console.log("⚠️ Preset déjà existant, pas d'écrasement :", exists);
                    alert("❌ Ce preset existe déjà.");
                    return; // on ne recrée pas pour garder le name
                }
                if (history.length >= nbValeurMax) {
                    console.log("⛔ Limite atteinte : impossible d'ajouter plus de " + nbValeurMax + " presets");
                    alert("❌ Vous ne pouvez pas enregistrer plus de " + nbValeurMax + " durées.\nSupprimez-en une avant d’ajouter une nouvelle.\nClique droit > Supprimer");
                    return;
                }
                history.unshift({ debut, fin, name: name || null });
                // history = history.slice(0, nbValeurMax); // Limite le nombre d'éléments
                localStorage.setItem("promo_dates_history", JSON.stringify(history));
                console.log("✅ Historique mis à jour :", history);
                renderButtons();
            }

            function deletePreset(index) {
                console.log("🗑️ Suppression preset :", history[index]);
                history.splice(index, 1);
                localStorage.setItem("promo_dates_history", JSON.stringify(history));
                renderButtons();
            }

            function renamePreset(index) {
                const old = history[index];
                const newName = prompt("Entrez un nom pour ce preset :", old.name || "");
                if (newName !== null && newName.trim() !== "") {
                    history[index].name = newName.trim();
                    localStorage.setItem("promo_dates_history", JSON.stringify(history));
                    console.log("✏️ Preset renommé :", history[index]);
                    renderButtons();
                }
            }

            function applyDates(debut, fin) {
                console.log("🎯 Application preset :", debut, fin);
                inputDateDebut.value = debut;
                inputDateDebut.dispatchEvent(new Event('input', { bubbles: true }));
                inputDateDebut.dispatchEvent(new Event('change', { bubbles: true }));

                inputDateFin.value = fin;
                inputDateFin.dispatchEvent(new Event('input', { bubbles: true }));
                inputDateFin.dispatchEvent(new Event('change', { bubbles: true }));

                if (doc.querySelector('#specific_price_impact_disabling_switch_reduction_1')?.checked === false) {
                    console.log("➡️ Toggle remise détecté comme désactivé");
                    doc.querySelector('#specific_price_impact_disabling_switch_reduction_1')?.click();
                    doc.querySelector('#specific_price_impact_disabling_switch_reduction').dispatchEvent(new Event('input', { bubbles: true }));
                    displayNotif("✅ Toggle remise activé automatiquement");
                    console.log("✅ Toggle remise activé automatiquement");
                    if (doc.querySelector('#specific_price_impact_reduction_value').value == "0,000000") {
                        doc.querySelector('#specific_price_impact_reduction_value').value = "";
                        doc.querySelector('#specific_price_impact_reduction_value').dispatchEvent(new Event('change', { bubbles: true }));
                        console.log("✅ Input remise vidé automatiquement");
                        doc.querySelector('#specific_price_impact_reduction_value').focus();
                    }
                } else {
                    console.log("➡️ Toggle remise déjà activé OU non détecté");
                }
            }

            function renderButtons() {
                container.innerHTML = "";

                // Bouton sauvegarde
                const saveBtn = doc.createElement("button");
                saveBtn.type = "button";
                saveBtn.title = "Sauvegarder les dates de début et de fin actuelles";
                saveBtn.textContent = "💾 Sauvegarder cette durée";
                saveBtn.className = "btn btn-sm btn-success";
                saveBtn.style.marginRight = "10px";
                saveBtn.addEventListener("click", () => {
                    const debut = inputDateDebut.value?.trim();
                    const fin = inputDateFin.value?.trim();
                    saveHistory(debut, fin);
                });
                container.appendChild(saveBtn);

                history.forEach((item, idx) => {
                    const btn = doc.createElement("button");
                    btn.type = "button";
                    btn.className = "btn btn-sm btn-outline-primary";

                    if (item.name) {
                        btn.textContent = `${item.name}\n${item.debut.split(" ")[0]} → ${item.fin.split(" ")[0]}`;
                    } else {
                        btn.textContent = `${item.debut.split(" ")[0]} → ${item.fin.split(" ")[0]}`;
                    }

                    btn.addEventListener("click", () => applyDates(item.debut, item.fin));

                    btn.addEventListener("contextmenu", (e) => {
                        e.preventDefault();

                        const oldMenu = doc.querySelector("#preset-context-menu");
                        if (oldMenu) oldMenu.remove();

                        const menu = doc.createElement("div");
                        menu.id = "preset-context-menu";
                        menu.style.top = e.pageY + "px";
                        menu.style.left = e.pageX + "px";

                        const renameOption = doc.createElement("div");
                        renameOption.textContent = "✏️ Renommer";
                        renameOption.addEventListener("click", () => {
                            renamePreset(idx);
                            menu.remove();
                        });

                        const deleteOption = doc.createElement("div");
                        deleteOption.textContent = "🗑️ Supprimer";
                        deleteOption.addEventListener("click", () => {
                            deletePreset(idx);
                            menu.remove();
                        });

                        menu.appendChild(renameOption);
                        menu.appendChild(deleteOption);
                        doc.body.appendChild(menu);

                        doc.addEventListener("click", () => menu.remove(), { once: true });
                    });

                    container.appendChild(btn);
                });
            }
            renderButtons();
        }
    });

    ///// Affichage des 3 stocks en même temps (iframe)
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

////////////////////////// FONCTIONS UTILITAIRES //////////////////////////

function getCombinations(productId, token, prixBaseTTC, prixBaseHT, callback) {
    if (!productId || !token) {
        console.warn(`[${new Date().toLocaleString()}] ❌ Impossible de détecter l'ID produit ou le token.`);
        return;
    }

    const shopId = 1;
    const apiUrl = `${location.origin}/logcncin/index.php/sell/catalog/products-v2/${productId}/combinations?shopId=${shopId}&product_combinations_${productId}[offset]=0&product_combinations_${productId}[limit]=100&_token=${token}`;

    fetch(apiUrl, { credentials: "same-origin" })
        .then(response => response.json())
        .then(data => {
            if (!data.combinations || !Array.isArray(data.combinations)) {
                console.warn(`[${new Date().toLocaleString()}] ❌ Format de données inattendu :`, data);
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
            displayNotif("❌ Erreur lors du chargement des déclinaisons. Changer de page et revenir pour réessayer.");
            if (typeof callback === "function") callback([]);
        });
}

function displayNotif(message, duree) {
    duree = duree || 2500;
    // Vérifie si le conteneur existe déjà
    let container = document.getElementById('CSP_tools-notif-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'CSP_tools-notif-container';
        document.body.appendChild(container);

        // Injecte le CSS si pas déjà présent
        if (!document.getElementById('CSP_tools-notif-style')) {
            const style = document.createElement('style');
            style.id = 'CSP_tools-notif-style';
            style.textContent = `
              #CSP_tools-notif-container {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 9999;
                pointer-events: none;
              }

              .CSP_tools-custom-notif {
                background-color: #323232;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                opacity: 0;
                transform: translateY(-10px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: none;
              }

              .CSP_tools-custom-notif.show {
                opacity: 1;
                transform: translateY(0);
              }
            `;
            document.head.appendChild(style);
        }
    }
    // Si une notification avec le même message existe déjà, on ne fait rien
    if (document.querySelector('.CSP_tools-custom-notif')?.textContent === message) return;

    // Crée une notification individuelle
    const notif = document.createElement('div');
    notif.className = 'CSP_tools-custom-notif';
    notif.textContent = message;
    container.appendChild(notif);

    // Animation d'apparition
    setTimeout(() => notif.classList.add('show'), 10);

    // Disparition au bout de 2.5 secondes
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, duree);
}

function normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD")              // sépare les accents
        .replace(/[\u0300-\u036f]/g, "") // supprime les accents
        .trim();
}
