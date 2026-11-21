console.log("✅ Script injecté !  content-admin-catalog.js");

//// Récupère le token dans le menu (plus fiable que l'URL)
const urlElemMenuCatalog = new URL(document.querySelector('li#subtab-AdminProducts a')?.href);
const tokenCatalog = urlElemMenuCatalog.search.split('=')[urlElemMenuCatalog.search.split('=').length - 1];
chrome.storage.local.set({ token_admin: tokenCatalog }); // stock la valeur actuelle
console.log("✅ Token Catalog extrait du menu :", tokenCatalog);

console.log("🔄 Vérification du type de page :", window.location.pathname.split("/"));
if (window.location.pathname.split("/")[window.location.pathname.split("/").length - 1] == "" && window.location.pathname.includes("catalog")) {
    console.log("✅ Page catalogue détectée, ajout des actions...");
    document.title = "Catalogue " + document.title; // Change le titre de la page pour le catalogue

    try {
        const keys = [
            "toggle_catalog_patch_category_filter",
            "toggle_catalog_copy_aicm_buttons",
            "toggle_catalog_no_aicm_warning",
            "toggle_catalog_display_combinations",
            "select_catalog_display_combinations",
            "select_catalog_display_combinations_default",
            "toggle_catalog_display_promotions",
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

                //déplie le 1er niveau de catégories
                const premiersNiveaux = filtreCategorie.querySelector('#category_filter > ul > li.category-node.more > div');
                console.log("Dépliage du 1er niveau de catégories", premiersNiveaux);
                if (premiersNiveaux)
                    premiersNiveaux.click();
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
                console.log("🔄 Injection des déclinaisons");
                const displayMode = data.select_catalog_display_combinations || data.select_catalog_display_combinations_default;

                async function injectCombinations(batchSize = 5) {
                    const elements = Array.from(document.querySelectorAll(".column-reference"));

                    // Séparer en 2 groupes : prioritaires et reste
                    const prioritaires = elements.filter(el =>
                        !el.innerText ||
                        el.innerText.trim() === "" ||
                        el.innerText.includes("Aucun code AICM") ||
                        el.innerText.includes("Déclinaisons ?")
                    );
                    const autres = elements.filter(el => !prioritaires.includes(el));

                    // Fonction utilitaire qui traite un paquet d’éléments
                    async function processBatch(batch) {
                        const promises = batch.map(el => {
                            const productId = el.previousElementSibling.previousElementSibling.previousElementSibling.innerText.trim();
                            if (!productId) return Promise.resolve();

                            return new Promise(resolve => {
                                getCombinations(productId, tokenCatalog, "", "", (liste) => {
                                    el.style.maxWidth = "200px";
                                    if (displayMode === "resume") {
                                        const refsConcatenees = liste.map(c => c.ref).filter(ref => ref).join(" ");
                                        if (refsConcatenees) {
                                            el.querySelector("a").innerText = `${liste.length} Déclinaisons :\n`;
                                            const elem = document.createElement('span');
                                            elem.style.cssText = 'white-space: normal !important;';
                                            elem.innerText = refsConcatenees;
                                            el.appendChild(elem);
                                        } else if (liste.length != 0) {
                                            el.querySelector("a").innerText = `${liste.length} Déclinaisons :\nAucun code AICM`;
                                        }

                                        if (liste.length != 0) {
                                            const link = el.querySelector("a");
                                            const [baseUrl] = link.href.split("#");
                                            link.href = `${baseUrl}#tab-product_combinations-tab`;
                                        }

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

                                        const stock = liste.map(c => c.quantity).filter(quantity => quantity).join("+");
                                        if (stock) {
                                            const stockElem = document.createElement('div');
                                            stockElem.innerText = `Qté : ${stock}`;
                                            el.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.appendChild(stockElem);
                                        }
                                    } else if (displayMode === "detail") {
                                        // A FAIRE
                                    }

                                    resolve();
                                });
                            });
                        });
                        await Promise.all(promises);
                    }

                    // 1️⃣ traiter les prioritaires directement (par batch de 5 aussi pour éviter surcharge)
                    for (let i = 0; i < prioritaires.length; i += batchSize) {
                        await processBatch(prioritaires.slice(i, i + batchSize));
                    }

                    // 2️⃣ ensuite traiter les autres
                    for (let i = 0; i < autres.length; i += batchSize) {
                        await processBatch(autres.slice(i, i + batchSize));
                    }

                    // ✅ quand tout est terminé
                    console.log("✅ Affichage des déclinaisons terminée");
                    displayNotif("✅ Affichage des déclinaisons terminée");
                }

                injectCombinations();
            }

            if (data.toggle_catalog_display_promotions) {
                console.log("🔄 Ajout des promos dans le tableau du catalogue");
                // Parcours du tableau et injection des promos, par paquets de 5
                async function injectPromosInTable(batchSize = 5) {
                    const rows = Array.from(document.querySelectorAll(".column-id_product"));

                    for (let i = 0; i < rows.length; i += batchSize) {
                        const batch = rows.slice(i, i + batchSize);

                        // Lance les fetch en parallèle pour le paquet
                        const promises = batch.map(el => {
                            const productId = el.innerText.trim();
                            if (!productId) return Promise.resolve();

                            return new Promise(resolve => {
                                fetchSpecificPrices(productId, (liste) => {
                                    const activePromos = liste.filter(isSpecificPricesActive);
                                    if (activePromos.length > 0) {
                                        activePromos.forEach(promo => {
                                            const span = document.createElement("span");
                                            span.style.cssText = "display:block; white-space: nowrap; color:#e70000; font-weight:bold;";
                                            span.title = `Promo active du ${promo.period?.from} au ${promo.period?.to} \nDéclinaison: ${promo.combination}\nImpact: ${promo.impact}${promo.price && promo.price != "--" ? `\nPrix Spé : ${promo.price}` : ""}`;
                                            span.innerText = promo.impact;
                                            if (promo.price && promo.price != "--")
                                                span.innerText = span.innerText + `\nPrix Spé : ${promo.price}`;
                                            el.parentElement.querySelector('.column-price_tax_included').appendChild(span);
                                        });
                                    }
                                    const comingPromos = liste.filter(isSpecificPricesComming);
                                    if (comingPromos.length > 0) {
                                        comingPromos.forEach(promo => {
                                            const span = document.createElement("span");
                                            span.style.cssText = "display:block; white-space: nowrap; color:green; font-weight:bold;";
                                            span.title = `Promo à venir du ${promo.period?.from} au ${promo.period?.to} \nDéclinaison: ${promo.combination}\nImpact: ${promo.impact}${promo.price && promo.price != "--" ? `\nPrix Spé : ${promo.price}` : ""}`;
                                            span.innerText = `À venir: ${promo.impact}`;
                                            if (promo.price && promo.price != "--")
                                                span.innerText = span.innerText + `\nPrix Spé : ${promo.price}`;
                                            el.parentElement.querySelector('.column-price_tax_included').appendChild(span);
                                        });
                                    }
                                    resolve();
                                });
                            });
                        });
                        // Attendre que tout le paquet soit fini avant de passer au suivant
                        await Promise.all(promises);
                    }
                    console.log("✅ Affichage des promos terminée");
                    displayNotif("✅ Affichage des promos terminée");
                }
                injectPromosInTable();
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

////////////////////////// FONCTIONS UTILITAIRES //////////////////////////

const fetchController = new AbortController();
window.addEventListener("beforeunload", () => {
    fetchController.abort(); // annule toutes les requêtes en cours
});

function fetchSpecificPrices(productId, callback) {
    if (!tokenCatalog) throw new Error("TokenCatalog introuvable dans l'URL du menu");

    // Construire l'URL de l'API
    const url = `${location.origin}/logcncin/index.php/sell/catalog/products-v2/${productId}/specific-prices/list?limit=10&offset=0&_token=${tokenCatalog}`;

    fetch(url, {
        method: "GET",
        headers: {
            "accept": "application/json",
            "x-requested-with": "XMLHttpRequest"
        },
        credentials: "include", // garde la session admin
        signal: fetchController.signal // 👉 lié au contrôleur
    })
        .then(response => response.json())
        .then(data => {
            console.log(`🎯 Promotions récupérées (ID: ${productId}) :`, data.specificPrices);
            const list = (data && Array.isArray(data.specificPrices)) ? data.specificPrices : [];
            if (typeof callback === "function") callback(list);
        })
        .catch(err => {
            if (err.name === "AbortError") {
                console.log(`⏹️ (fetchSpecificPrices) Fetch annulé (ID: ${productId}) à cause du changement de page`);
                return; // on ignore proprement
            }
            console.error(`❌ Erreur récupération promotions (ID: ${productId}) :`, err);
            displayNotif("❌ Erreur lors du chargement des promotions. Changer de page et revenir pour réessayer.");
            if (typeof callback === "function") callback([]);
        });
}
function isSpecificPricesActive(promo) {
    const now = new Date();

    const from = (promo.period && promo.period.from && promo.period.from !== "Toujours") ? new Date(promo.period.from) : null;
    const to = (promo.period && promo.period.to && promo.period.to !== "Toujours") ? new Date(promo.period.to) : null;

    if (from && now < from) return false;
    if (to && now > to) return false;
    return true;
}
function isSpecificPricesComming(promo) {
    const now = new Date();
    const from = (promo.period && promo.period.from && promo.period.from !== "Toujours") ? new Date(promo.period.from) : null;
    if (from && now < from) return true;
    return false;
}
