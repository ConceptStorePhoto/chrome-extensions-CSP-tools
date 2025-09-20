console.log("✅ Script injecté !  content-admin-catalog-product.js");

// // récupération du token dans l'url du site si page admin
// let token = "";
// if (window.location.search.includes('token=')) {
//     token = window.location.search.split('=')[window.location.search.split('=').length - 1]; // récupère le dernier paramètre de l'URL
//     console.log("✅ Token récupéré depuis l'URL :", token);
//     chrome.storage.local.set({ token_admin: token }); // stock la valeur actuelle
//     // localStorage.setItem("CSP_token_admin", token); // stock la valeur actuelle
// }

if (window.location.pathname.split("/")[window.location.pathname.split("/").length - 1] == "edit" && window.location.pathname.includes("products-v2")) {
    console.log("✅ Page produit détectée !!");



}