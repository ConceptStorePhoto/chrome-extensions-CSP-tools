console.log("✅ Script injecté !  content-client.js");

let token = "";

chrome.storage.local.get("token_admin", (data) => {
    if (data.token_admin == "" || !data.token_admin) return; // Ne rien faire si vide ou non défini
    console.log("✅ Token récupéré depuis le stockage :", data.token_admin);
    token = data.token_admin; //récupere la valeur de la mémoire

    if (window.location.pathname.startsWith("/logcncin/index.php/sell/catalog/products-v2/")) return; // Ne pas exécuter le script si on est dans l'admin

    chrome.storage.sync.get(["toggle_client_adminEdit_buttons", "toggle_client_adminEditBtn_miniature"], (data) => {
        // Vérifie si on est sur une page PRODUIT côté client
        const match = window.location.pathname.match(/^\/(\d{2,5})-/);
        console.log("🔄 Vérification du type de page :", match);
        if (match && document.body.id == "product") {
            if (data.toggle_client_adminEdit_buttons)
                addAdminLinkButtonProduct();
        }
        // else if (document.body.id == "search" || document.body.id == "category" || document.body.id == "index")
        if (data.toggle_client_adminEditBtn_miniature)
            addAdminLinkButtonMiniature();
    });
});

///////////// FONCTIONS //////////////

function addAdminLinkButtonProduct() {
    console.log("🔄 Ajout du bouton d'édition admin");
    const productId = window.location.pathname.split("/")[1].split("-")[0];
    console.log("➡️ ID produit :", productId);
    createAdminButton(productId, { fixed: true, top: "129px", right: "20px", zIndex: "9999" }, document.body);
}

function addAdminLinkButtonMiniature() {
    console.log("🔄 Ajout du bouton pour chaque produit");
    const products = document.querySelectorAll("article.product-miniature");
    products.forEach((product) => {
        createAdminButton(product.getAttribute("data-id-product"), { fixed: false, top: "160px", right: "50%", transform: "translateX(50%)" }, product);
    });
}

function createAdminButton(productId, style, container) {
    if (!productId) return;

    const domain = window.location.hostname;
    const adminLink = `https://${domain}/logcncin/index.php/sell/catalog/products-v2/${productId}/edit?_token=${token}`;
    const button = document.createElement("a");
    button.href = adminLink;
    button.className = "CSP_tools-custom-btn";
    button.title = "Clique = Ouvrir || Clic droit = Ouvrir dans nouvel onglet";
    button.innerText = "Modifier Produit";
    Object.assign(button.style, {
        position: style.fixed ? "fixed" : "absolute",
        top: style.top,
        right: style.right,
        zIndex: style.zIndex || "",
        transform: style.transform || ""
    });
    insertBtnStyle();

    // Ouvre dans un nouvel onglet si clic droit
    button.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        window.open(adminLink, "_blank");
    });

    container.appendChild(button);
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