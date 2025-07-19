console.log("✅ Script injecté !  content-client.js");

let token = "";

chrome.storage.local.get("token_admin", (data) => {
    if (data.token_admin == "" || !data.token_admin) return; // Ne rien faire si vide ou non défini
    console.log("✅ Token récupéré depuis le stockage :", data.token_admin);
    token = data.token_admin; //récupere la valeur de la mémoire

    chrome.storage.sync.get("toggle_client_adminEdit_buttons", (data) => {
        if (!data.toggle_client_adminEdit_buttons) return; // Ne rien faire si désactivé
        console.log("🔄 Ajout du bouton d'édition admin");

        // Vérifie si on est sur une page PRODUIT côté client
        const match = window.location.pathname.match(/^\/(\d{2,5})-/);
        console.log("🔄 Vérification du type de page :", match);
        if (!(window.location.pathname.startsWith("/logcncin/index.php/sell/catalog/products-v2/")) && match && document.body.id == "product") {
            addAdminLinkButton();
        }
    });
});


//ajout un bouton sur les pages produit coté client pour rediriger vers le produit dans l'admin
function addAdminLinkButton() {
    const productId = window.location.pathname.split("/")[1].split("-")[0];
    console.log("➡️ ID produit :", productId);
    if (!productId) return; // Si pas d'ID de produit, on ne fait rien

    const domain = window.location.hostname;
    const adminLink = `https://${domain}/logcncin/index.php/sell/catalog/products-v2/${productId}/edit?_token=${token}`;
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