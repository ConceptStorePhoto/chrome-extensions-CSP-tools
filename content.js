console.log("✅ Script injecté !");

function ajouterCopyBoutons() {
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
    } catch (error) {
        console.error("Erreur lors de l'ajout des boutons de copie :", error);
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



async function fetchEAN(url) {
    try {
        const res = await fetch(url, { credentials: 'include' }); // important si la session est nécessaire
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const text = await res.text();

        // Parser le HTML reçu
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        // console.log("Document chargé pour l'EAN:", doc);

        // Récupérer l'élément contenant l'EAN
        const eanEl = doc.querySelector('#product_details_references_ean_13');
        console.log("EAN Element:", eanEl);
        return eanEl ? eanEl.textContent.trim() : null;
    } catch (e) {
        console.error('Erreur fetch EAN:', e);
        return null;
    }
}

async function ajouterEANs() {
    console.log("🔄 Ajout des EANs");

    // Sélecteur des lignes produits (à adapter selon ta page)  #product_grid_table > tbody > tr:nth-child(1) > td.link-type.column-reference.text-left > a
    const lignes = document.querySelectorAll('#product_grid_table tbody tr'); // remplacer par le vrai sélecteur

    for (const ligne of lignes) {
        // Trouver le lien vers la fiche produit dans la ligne
        const lien = ligne.querySelector('.link-type.column-reference a').href; // adapter sélecteur
        console.log("Lien produit:", lien);

        if (!lien) continue;

        // Évite de refaire la requête si déjà affiché
        if (ligne.querySelector('.ean13')) continue;

        const ean = await fetchEAN(lien.href);
        if (ean) {
            const span = document.createElement('span');
            span.className = 'ean13';
            span.textContent = `EAN: ${ean}`;
            span.style.marginLeft = '10px';
            ligne.appendChild(span);
        }
    }
}

// Lancer la fonction (tu peux ajouter MutationObserver si les lignes se chargent dynamiquement)
ajouterEANs();




// MutationObserver pour suivre les changements du DOM
const observer = new MutationObserver(ajouterCopyBoutons);
observer.observe(document.body, { childList: true, subtree: true });


// Exécution initiale
ajouterCopyBoutons();
previewBoutons();
