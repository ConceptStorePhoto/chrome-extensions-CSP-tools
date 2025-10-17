console.log("✅ Script injecté !  functions/common-functions-prestashop.js");

// Contrôleur d'annulation des fetch en cours lors du changement de page
const commonFetchController = new AbortController();
window.addEventListener("beforeunload", () => {
    commonFetchController.abort(); // annule toutes les requêtes en cours
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
console.log("✅ common-functions-prestashop.js : getCombinations ");

function getCombinations(productId, token, prixBaseTTC, prixBaseHT, callback) {
    if (!productId || !token) {
        console.warn(`[${new Date().toLocaleString()}] ❌ Impossible de détecter l'ID produit ou le token.`);
        return;
    }

    const shopId = 1;
    const apiUrl = `${location.origin}/logcncin/index.php/sell/catalog/products-v2/${productId}/combinations?shopId=${shopId}&product_combinations_${productId}[offset]=0&product_combinations_${productId}[limit]=100&_token=${token}`;

    fetch(apiUrl, { credentials: "same-origin", signal: commonFetchController.signal })
        .then(response => response.json())
        .then(data => {
            if (!data.combinations || !Array.isArray(data.combinations)) {
                console.warn(`[${new Date().toLocaleString()}] ❌ Format de données inattendu :`, data);
                return;
            }
            // console.log("📦 DATA Déclinaisons récupérées via API :", data);

            const liste = data.combinations.map(c => {
                const impact = parseFloat(c.impact_on_price_te.replace(',', '.'));
                return {
                    id: c.combination_id,
                    name: c.name,
                    ref: c.reference,
                    quantity: c.quantity,
                    impact_price_ht: impact,
                    calcul_prix_ttc_final: prixBaseTTC + (impact * 1.2),
                    calcul_prix_ttc_TEST: (prixBaseHT + impact) * 1.2
                };
            });

            console.log(`📦 Déclinaisons récupérées (${productId}) :`, liste);
            if (typeof callback === "function") callback(liste);
        })
        .catch(err => {
            if (err.name === "AbortError") {
                console.log(`⏹️ (getCombinations) Fetch annulé (ID: ${productId}) à cause du changement de page`);
                return; // on ignore proprement
            }
            console.error(`[${new Date().toLocaleString()}] ❌ Erreur lors du chargement des déclinaisons :`, err);
            displayNotif("❌ Erreur lors du chargement des déclinaisons. Changer de page et revenir pour réessayer.");
            if (typeof callback === "function") callback([]);
        });
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
console.log("✅ common-functions-prestashop.js : normalize ");

function normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD")              // sépare les accents
        .replace(/[\u0300-\u036f]/g, "") // supprime les accents
        .trim();
}