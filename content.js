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


///////////////

let token = "";
// récupération du tocken dans l'url du site si page admin
// console.log("🔄 Récupération du token depuis l'URL ", window.location);
if (window.location.search.includes('token=')) {
    token = window.location.search.split('=')[window.location.search.split('=').length - 1]; // récupère le dernier paramètre de l'URL
    console.log("🔄 Token récupéré depuis l'URL :", token);
    chrome.storage.sync.set({ token_admin: token }); // stock la valeur actuelle
}

chrome.storage.sync.get("token_admin", (data) => {
    if (data.token_admin == "" || !data.token_admin) return; // Ne rien faire si vide ou non défini
    console.log("🔄 Token récupéré depuis le stockage :", data.token_admin);
    token = data.token_admin; //récupere la valeur de la mémoire

    chrome.storage.sync.get("toggle_adminEdit_buttons", (data) => {
        if (!data.toggle_adminEdit_buttons) return; // Ne rien faire si désactivé
        console.log("🔄 Ajout du bouton d'édition admin");

        // Vérifie si on est sur une page produit côté client
        if (!(window.location.pathname.startsWith("/logcncin/index.php/sell/catalog/products-v2/"))) {
            addAdminLinkButton();
        }
    });
});


//ajout un bouton sur les pages produit coté client pour rediriger vers le produit dans l'admin
function addAdminLinkButton() {
    //récupération de l'id dans l'url : exemple"https://concept-store-photo.dmu.sarl/39851-mini-max-creator-kit.html"
    const productId = window.location.pathname.split("/")[1].split("-")[0];
    console.log("🔄 ID produit :", productId);
    if (!productId) return; // Si pas d'ID de produit, on ne fait rien

    const adminLink = `https://concept-store-photo.dmu.sarl/logcncin/index.php/sell/catalog/products-v2/${productId}/edit?_token=${token}`;
    const button = document.createElement("a");
    button.href = adminLink;
    button.target = "_blank";
    button.innerText = "Modifier Produit";
    button.style.fontSize = "16px";
    button.style.position = "fixed";
    button.style.top = "129px";
    button.style.right = "20px";
    button.style.padding = "8px 15px";
    button.style.backgroundColor = "#007bff";
    button.style.color = "#fff";
    button.style.borderRadius = "5px";
    button.style.textDecoration = "none";
    button.style.zIndex = "9999";

    document.body.appendChild(button);
}
