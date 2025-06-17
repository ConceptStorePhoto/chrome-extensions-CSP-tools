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
                    event.stopPropagation(); // évite les comportements attachés ailleurs
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
                if (!el.innerText || el.innerText.trim() === "" || el.innerText.includes("Aucun code AICM")) {
                    el.querySelector("a").innerText = "Aucun code AICM";
                    el.querySelector("a").setAttribute("style", "color: red !important"); // Met en rouge si pas de code
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


    } catch (error) {
        console.error("Erreur lors de l'ajout des boutons/actions dans le catalogue :", error);
    }
}

function productActions() {
    chrome.storage.sync.get("toggle_preview_buttons", (data) => {
        if (!data.toggle_preview_buttons) return; // Ne rien faire si désactivé
        console.log("🔄 Ajout des boutons de prévisualisation");

        const elements = document.querySelectorAll("#product_footer_actions_preview");
        elements.forEach((el) => {
            //copier le bouton sélectioner dans l'élément parent
            let element = document.createElement("a");
            element.href = el.href;
            element.target = "_blank";
            element.innerHTML = `<i class="material-icons">visibility</i>`;
            el.parentNode.parentNode.appendChild(element);
        });

    });
}




/////// Exécution initiale

// catalogActions();
// productActions();

// déclenchement des actions sur les pages correspondantes
console.log("🔄 Vérification du type de page :", window.location.pathname.split("/"));
if (window.location.pathname.split("/")[window.location.pathname.split("/").length - 1] == "" && window.location.pathname.includes("catalog")) {
    console.log("✅ Page catalogue détectée, ajout des actions...");
    catalogActions();

    // MutationObserver pour suivre les changements du DOM
    // const observer = new MutationObserver(catalogActions);
    // observer.observe(document.body, { childList: true, subtree: true });
}
else if (window.location.pathname.split("/")[window.location.pathname.split("/").length - 1] == "edit" && window.location.pathname.includes("products-v2")) {
    console.log("✅ Page produit détectée, ajout des actions...");
    productActions();
}

///////////////

let token = "";
// récupération du tocken dans l'url du site si page admin
// console.log("🔄 Récupération du token depuis l'URL ", window.location);
if (window.location.search.includes('token=')) {
    token = window.location.search.split('=')[window.location.search.split('=').length - 1]; // récupère le dernier paramètre de l'URL
    console.log("🔄 Token récupéré depuis l'URL :", token);
    chrome.storage.sync.set({ token_admin: token }); // stock la valeur actuelle
}

