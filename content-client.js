console.log("✅ Script injecté !  content-client.js");

let token = "";

chrome.storage.local.get("token_admin", (data) => {
    if (data.token_admin == "" || !data.token_admin) return; // Ne rien faire si vide ou non défini
    console.log("✅ Token récupéré depuis le stockage :", data.token_admin);
    token = data.token_admin; //récupere la valeur de la mémoire

    chrome.storage.sync.get(["toggle_client_adminEdit_buttons", "toggle_client_search_adminEditBtn"], (data) => {
        // Vérifie si on est sur une page PRODUIT côté client
        const match = window.location.pathname.match(/^\/(\d{2,5})-/);
        console.log("🔄 Vérification du type de page :", match);
        if (!(window.location.pathname.startsWith("/logcncin/index.php/sell/catalog/products-v2/")) && match && document.body.id == "product") {
            if (data.toggle_client_adminEdit_buttons)
                addAdminLinkButton();
        }
        else if (!(window.location.pathname.startsWith("/logcncin/index.php/sell/catalog/products-v2/")) && (document.body.id == "search") || document.body.id == "category") {

            if (data.toggle_client_search_adminEditBtn) {
                console.log("🔄 Page de recherche de produits, ajout du bouton pour chaque produit");
                const products = document.querySelectorAll("article.product-miniature");
                products.forEach((product) => {
                    const productId = product.getAttribute("data-id-product");
                    if (productId) {
                        const adminLink = `https://${window.location.hostname}/logcncin/index.php/sell/catalog/products-v2/${productId}/edit?_token=${token}`;
                        const button = document.createElement("a");
                        button.href = adminLink;
                        button.className = "CSP_tools-custom-btn";
                        button.title = "Clique = Ouvrir || Clic droit = Ouvrir dans nouvel onglet";
                        button.innerText = "Modifier Produit";
                        button.style.position = "absolute";
                        button.style.top = "160px";
                        button.style.right = "50%";
                        button.style.transform = "translateX(50%)";
                        insertBtnStyle();

                        // Comportement normal sur clic gauche
                        button.addEventListener("click", (e) => {
                            if (e.button === 2) { // clic droit
                                e.preventDefault();
                                window.open(adminLink, "_blank");
                            }
                        });
                        // Empêche le menu contextuel natif si besoin (optionnel)
                        button.addEventListener("contextmenu", (e) => {
                            e.preventDefault(); // empêche le menu contextuel si tu veux un comportement propre
                            window.open(adminLink, "_blank");
                        });
                        product.appendChild(button);
                    }
                });
            }

        }
    });
});


//ajout un bouton sur les pages produit coté client pour rediriger vers le produit dans l'admin
function addAdminLinkButton() {
    console.log("🔄 Ajout du bouton d'édition admin");
    const productId = window.location.pathname.split("/")[1].split("-")[0];
    console.log("➡️ ID produit :", productId);
    if (!productId) return; // Si pas d'ID de produit, on ne fait rien

    const domain = window.location.hostname;
    const adminLink = `https://${domain}/logcncin/index.php/sell/catalog/products-v2/${productId}/edit?_token=${token}`;
    const button = document.createElement("a");
    button.href = adminLink;
    button.className = "CSP_tools-custom-btn";
    button.title = "Clique = Ouvrir || Clic droit = Ouvrir dans nouvel onglet";
    // button.target = "_blank";
    button.innerText = "Modifier Produit";
    button.style.position = "fixed";
    button.style.top = "129px";
    button.style.right = "20px";
    button.style.zIndex = "9999";
    insertBtnStyle();

    // Comportement normal sur clic gauche
    button.addEventListener("click", (e) => {
        if (e.button === 2) { // clic droit
            e.preventDefault();
            window.open(adminLink, "_blank");
        }
    });
    // Empêche le menu contextuel natif si besoin (optionnel)
    button.addEventListener("contextmenu", (e) => {
        e.preventDefault(); // empêche le menu contextuel si tu veux un comportement propre
        window.open(adminLink, "_blank");
    });

    document.body.appendChild(button);
}

function insertBtnStyle() {
    const style = document.createElement("style");
    style.textContent = `
        .CSP_tools-custom-btn {
            font-size: 16px;
            padding: 8px 15px;
            background-color: #007bff;
            color: #fff;
            border-radius: 5px;
            text-decoration: none;
        }
    `;
    document.head.appendChild(style);
}