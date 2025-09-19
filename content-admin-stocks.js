console.log("✅ Script injecté ! content-admin-stocks.js");

// Récupérer le token depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('_token') || "";
console.log("✅ Token récupéré depuis l'URL :", token);

// Fonction pour injecter les boutons ✏️
function addEditLinks() {
    document.querySelectorAll('td[data-role="product-id"]').forEach(td => {
        // Cherche le <p> qui contient vraiment l'ID
        const p = td.querySelector("p");
        if (!p) return;

        const productId = p.textContent.trim();
        if (!productId) return;

        // Évite de rajouter plusieurs fois
        if (td.querySelector("a.CSP-edit-link")) return;

        const editLink = document.createElement("a");
        editLink.href = `/logcncin/index.php/sell/catalog/products-v2/${productId}/edit?_token=${token}`;
        editLink.target = "_blank";
        editLink.title = "Ouvrir la page d'édition du produit dans un nouvel onglet";
        editLink.innerText = "✏️";
        editLink.classList.add("CSP-edit-link");

        td.querySelector('div.d-flex.align-items-left').appendChild(editLink);
        // console.log("➡️ Bouton ajouté pour le produit ID :", productId);
    });
}

// Observer les changements dans #stock-app
const targetNode = document.querySelector("#stock-app");
if (targetNode) {
    const observer = new MutationObserver(() => {
        addEditLinks();
    });
    observer.observe(targetNode, { childList: true, subtree: true });

    // Premier passage au chargement
    addEditLinks();
}

// Style pour les boutons
const style = document.createElement("style");
style.textContent = `
    a.CSP-edit-link {
        /*text-decoration: none;*/
        margin-left: 8px;
    }`;
document.head.appendChild(style);