console.log("✅ Script injecté !");

function catalogActions() {
    try {
        chrome.storage.sync.get("toggle_copy_buttons", (data) => {
            if (!data.toggle_copy_buttons) return; // Ne rien faire si désactivé
            console.log("🔄 Ajout des boutons de copie");

            const elements = document.querySelectorAll(".column-reference");
            elements.forEach((el) => {
                // Évite d'ajouter le bouton plusieurs fois
                if (el.querySelector("button.copier-btn")) return;

                // Vérifie que l'élément a du texte
                if (!el.innerText || el.innerText.trim() === "") return;

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

        chrome.storage.sync.get("toggle_catalogue_preview_buttons", (data) => {
            if (!data.toggle_catalogue_preview_buttons) return; // Ne rien faire si désactivé
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
                el.parentNode.parentNode.appendChild(element);
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

function previewBoutons() {
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



// MutationObserver pour suivre les changements du DOM
const observer = new MutationObserver(catalogActions);
observer.observe(document.body, { childList: true, subtree: true });


// Exécution initiale
catalogActions();
previewBoutons();
