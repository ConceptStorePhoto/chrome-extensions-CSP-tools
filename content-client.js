console.log("✅ Script injecté !  content-client.js");

let token = "";

chrome.storage.local.get("token_admin", (data) => {
    if (data.token_admin == "" || !data.token_admin) return; // Ne rien faire si vide ou non défini
    console.log("✅ Token récupéré depuis le stockage :", data.token_admin);
    token = data.token_admin; //récupere la valeur de la mémoire

    if (window.location.pathname.startsWith("/logcncin/index.php/sell/catalog/products-v2/")) return; // Ne pas exécuter le script si on est dans l'admin

    chrome.storage.sync.get(["toggle_client_adminEdit_buttons", "toggle_client_adminEditBtn_miniature", "toggle_client_adminBandeau"], (data) => {
        // Vérifie si on est sur une page PRODUIT côté client
        const match = window.location.pathname.match(/^\/(\d{2,5})-/);
        console.log("🔄 Vérification du type de page :", match);
        if (match && document.body.id == "product") {
            if (data.toggle_client_adminEdit_buttons)
                addAdminLinkButtonProduct();
        }
        // else if (document.body.id == "search" || document.body.id == "category" || document.body.id == "index")
        if (data.toggle_client_adminEditBtn_miniature) {
            addAdminLinkButtonMiniature();

            const targetNode = document.querySelector("section#main");
            if (targetNode) {
                const observer = new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) {
                                observer.disconnect();
                                addAdminLinkButtonMiniature();
                                setTimeout(() => {
                                    observer.observe(targetNode, { childList: true, subtree: true });
                                }, 200);
                            }
                        });
                    }
                });
                observer.observe(targetNode, { childList: true, subtree: true });
            }
        }

        if (data.toggle_client_adminBandeau && token !== "") {

            ///// Création du bandeau /////
            const bandeau = document.createElement('div');
            const hauteur_bandeau = '30px';
            bandeau.id = "admin_bandeau";
            Object.assign(bandeau.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: hauteur_bandeau,
                backgroundColor: '#007bff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                zIndex: '9999'
            });
            document.body.appendChild(bandeau);
            // Décale le body vers le bas pour que le bandeau ne masque pas le contenu
            document.body.style.paddingTop = hauteur_bandeau;
            const style = document.createElement('style');
            style.textContent = `.header-sticky-active {padding-top: ${hauteur_bandeau} !important;}`;
            document.head.appendChild(style);


            const buttonAdmin = document.createElement("a");
            buttonAdmin.href = `https://${window.location.hostname}/logcncin/index.php?_token=${token}`;
            // buttonAdmin.title = "Clique = Ouvrir || Clic droit = Ouvrir dans nouvel onglet";
            buttonAdmin.innerText = "🔧 Accueil ADMIN";
            buttonAdmin.style.color = '#FFF';
            bandeau.appendChild(buttonAdmin);

            if (document.body.id == "product") {
                const productId = window.location.pathname.split("/")[1].split("-")[0];
                console.log("➡️ ID produit :", productId);
                if (!productId) return;
                const buttonEdit = document.createElement("a");
                buttonEdit.href = `https://${window.location.hostname}/logcncin/index.php/sell/catalog/products-v2/${productId}/edit?_token=${token}`;
                // buttonEdit.title = "Clique = Ouvrir || Clic droit = Ouvrir dans nouvel onglet";
                buttonEdit.innerText = "🖊️ Modifier produit";
                buttonEdit.style.color = '#FFF';
                bandeau.appendChild(buttonEdit);
            }
        }

    });
    insertBtnStyle();
});

///////////// FONCTIONS //////////////

function addAdminLinkButtonProduct() {
    console.log("🔄 Ajout du bouton d'édition admin");
    const productId = window.location.pathname.split("/")[1].split("-")[0];
    console.log("➡️ ID produit :", productId);
    createAdminButton(productId, { position: "fixed", top: "129px", right: "20px", zIndex: "9999" }, document.body);
}

function addAdminLinkButtonMiniature() {
    console.log("🔄 Ajout du bouton pour chaque produit");
    const products = document.querySelectorAll("article.product-miniature");
    products.forEach((product) => {
        if (product.querySelector('.CSP_tools-custom-btn')) return;
        createAdminButton(product.getAttribute("data-id-product"), { position: "absolute", top: "160px", right: "50%", transform: "translateX(50%)" }, product);
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
        position: style.position,
        top: style.top,
        right: style.right,
        zIndex: style.zIndex || "",
        transform: style.transform || ""
    });

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