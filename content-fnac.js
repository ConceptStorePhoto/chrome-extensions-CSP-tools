console.log("✅ Script injecté !  content-fnac.js");

// /////// Sélection des éléments PAGE vendez-le-votre ///////
// const selectEtat = document.querySelector('#shop_product_product_state_id'); // état du produit (Bon état = value 4)
// const textareaDescriptionFr = document.querySelector('#shop_product_shop_product_description_i18ns_0_comment'); // description du produit
// const inputPrix = document.querySelector('#shop_product_price'); // prix du produit
// const selectCategorie = document.querySelector('#shop_product_category_id'); // catégorie logistique du produit (catégorie D = value 104 = port 15.99€)
// const inputRefInterne = document.querySelector('#shop_product_sku'); // référence interne
// const textareaCommentaireInterne = document.querySelector('#shop_product_internal_comment'); // commentaire interne
// const inputDelaiPreparation = document.querySelector('#shop_product_shop_product_ltts'); // délai de préparation (2 jours = value 2)
// const buttonSubmit = document.querySelector('#shop_product_publish[type="submit"]'); // bouton pour soumettre le formulaire

// // Valeurs par défaut
// const texte_description = `Garantie de 6 mois - Retrouvez toutes nos offres sur notre site internet et dans nos boutiques Concept Store Photo de Nantes, Rennes et Vannes`;

// /////// Sélection des éléments PAGE vendez-le-votre ///////
// const inputEAN = document.querySelector('#search_by_reference_product_id'); // code EAN
// const buttonSearch = document.querySelector('button[type="submit"]#search_by_reference_search'); // bouton rechercher


/////// Sélection des éléments PAGE vendez-le-votre ///////
function getFicheElements() {
    return {
        selectEtat: document.querySelector('#shop_product_product_state_id'),
        textareaDescriptionFr: document.querySelector('#shop_product_shop_product_description_i18ns_0_comment'),
        inputPrix: document.querySelector('#shop_product_price'),
        selectCategorie: document.querySelector('#shop_product_category_id'),
        inputRefInterne: document.querySelector('#shop_product_sku'),
        textareaCommentaireInterne: document.querySelector('#shop_product_internal_comment'),
        inputDelaiPreparation: document.querySelector('#shop_product_shop_product_ltts'),
        buttonSubmit: document.querySelector('#shop_product_publish[type="submit"]')
    };
}

/////// Sélection des éléments PAGE ajouter-produit ///////
function getEanElements() {
    return {
        inputEAN: document.querySelector('#search_by_reference_product_id'),
        buttonSearch: document.querySelector('#search_by_reference_search')
    };
}

//////// Communication via runtime ///////
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("🔄 Message reçu dans Fnac :", message);

    if (message.action === "ean") {
        const { inputEAN, buttonSearch } = getEanElements();
        if (inputEAN) inputEAN.value = message.data.code;
        if (buttonSearch) buttonSearch.click();
        chrome.runtime.sendMessage({
            type: "broadcast",
            action: "fnac_fill_completed",
            data: {
                page: "ean",
                timestamp: Date.now()
            }
        });
    }
    else if (message.action === "fiche") {
        const { selectEtat, textareaDescriptionFr, inputPrix, selectCategorie, inputRefInterne, textareaCommentaireInterne, inputDelaiPreparation, buttonSubmit } = getFicheElements();
        if (selectEtat && message.data.etat) selectEtat.value = message.data.etat;
        if (textareaDescriptionFr && message.data.description) textareaDescriptionFr.value = message.data.description;
        if (inputPrix && message.data.prix) inputPrix.value = message.data.prix;
        if (selectCategorie && message.data.categorie) selectCategorie.value = message.data.categorie;
        if (inputRefInterne && message.data.ref) inputRefInterne.value = message.data.ref;
        if (textareaCommentaireInterne && message.data.commentaire) textareaCommentaireInterne.value = message.data.commentaire;
        if (inputDelaiPreparation && message.data.delai) inputDelaiPreparation.value = message.data.delai;
        // if (buttonSubmit) buttonSubmit.click();
        chrome.runtime.sendMessage({
            type: "broadcast",
            action: "fnac_fill_completed",
            data: {
                page: "fiche",
                timestamp: Date.now()
            }
        });
    }
    else if (message.action === "valider_fiche") {
        console.log("✅ Commande Validation fiche !");
        const buttonSubmit = document.querySelector('#shop_product_publish[type="submit"]'); // bouton pour soumettre le formulaire
        if (buttonSubmit) buttonSubmit.click();
        // chrome.runtime.sendMessage({
        //     type: "broadcast",
        //     action: "fnac_fiche_validee",
        //     data: {
        //         page: "fiche",
        //         timestamp: Date.now()
        //     }
        // });
    }
});

//////// Surveillance des changements de page ///////
function checkPageReady() {
    const isEanPage = window.location.pathname.includes("/compte/vendeur/inventaire/ajouter-produit");
    const isFichePage = window.location.pathname.includes("/vendez-le-votre/");
    return { isEanPage, isFichePage };
}

let lastState = { isEanPage: false, isFichePage: false };

function notifyPageState() {
    const state = checkPageReady();

    // EAN
    if (state.isEanPage && !lastState.isEanPage) {
        console.log("✅ Entrée dans la page EAN");
        chrome.runtime.sendMessage({ type: "broadcast", action: "page_fnac_ean_ready", ready: true });
    } else if (!state.isEanPage && lastState.isEanPage) {
        console.log("⚠️ Sortie de la page EAN → désactivation");
        chrome.runtime.sendMessage({ type: "broadcast", action: "page_fnac_ean_ready", ready: false });
    }

    // FICHE
    if (state.isFichePage && !lastState.isFichePage) {
        console.log("✅ Entrée dans la page FICHE");
        chrome.runtime.sendMessage({ type: "broadcast", action: "page_fnac_fiche_ready", ready: true });
    } else if (!state.isFichePage && lastState.isFichePage) {
        console.log("⚠️ Sortie de la page FICHE → désactivation");
        chrome.runtime.sendMessage({ type: "broadcast", action: "page_fnac_fiche_ready", ready: false });
    }

    lastState = state;
}

// Premier check
notifyPageState();

// Réécoute events navigateur classiques
window.addEventListener("popstate", notifyPageState);
window.addEventListener("hashchange", notifyPageState);
window.addEventListener("beforeunload", () => {
    console.log("🚪 Page Fnac se ferme → désactivation");
    chrome.runtime.sendMessage({
        type: "broadcast",
        action: "page_fnac_ean_ready",
        ready: false
    });
    chrome.runtime.sendMessage({
        type: "broadcast",
        action: "page_fnac_fiche_ready",
        ready: false
    });
});


// 🔑 Surveillance forcée toutes les x ms
setInterval(notifyPageState, 1000);

