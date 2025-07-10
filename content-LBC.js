console.log("✅ Script injecté !  content-LBC.js");

/////////// ELEMENT DE BASE ///////////

const style = document.createElement('style');
style.textContent = `
                .btn-swap {
                    font-size: 16px;
                    padding: 8px 15px;
                    background-color: #007bff;
                    color: #fff;
                    border-radius: 5px;
                    text-decoration: none;
                    height: fit-content;
                    cursor: pointer;
                    right:10px;
                }

                .btn-swap:hover {
                    background-color: #0056b3 !important;
                    }
                    `;
document.head.appendChild(style);

const divContainer = document.createElement('div');
divContainer.setAttribute('style', 'display: flex;flex-direction: column;position: fixed;top: 50%;right: 5px;z-index: 99999;gap:5px;transform: translateY(-50%);');
document.body.appendChild(divContainer);

/////////// FONCTIONS TEXTE & CLAVIER ///////////

function simulateTyping(selector, text) {
    const input = selector;
    if (!input) return;

    input.focus();

    for (const char of text) {
        const event = new KeyboardEvent("keydown", {
            key: char,
            code: char,
            charCode: char.charCodeAt(0),
            keyCode: char.charCodeAt(0),
            which: char.charCodeAt(0),
            bubbles: true,
            cancelable: true
        });
        input.dispatchEvent(event);
        input.value += char;

        const inputEvent = new Event("input", {
            bubbles: true,
            cancelable: true,
        });
        input.dispatchEvent(inputEvent);
    }
}

function simulateKeyPress(selector, key) {
    const event = new KeyboardEvent("keydown", {
        key: key,           // ex: "ArrowDown"
        code: key,          // ex: "ArrowDown"
        keyCode: keyMap[key], // pour compatibilité avec certains sites
        which: keyMap[key],
        bubbles: true,
        cancelable: true
    });

    if (!selector)
        document.dispatchEvent(event);
    else
        selector.dispatchEvent(event);
}
// mappage des touches vers leurs keyCodes
const keyMap = {
    ArrowDown: 40,
    ArrowUp: 38,
    ArrowLeft: 37,
    ArrowRight: 39,
    Enter: 13,
    Tab: 9
};

/////////// DETECTION CHANGEMENT URL ///////////

// 1. Exécution immédiate si on est déjà sur la page au moment du chargement
verificationUrlPage(location.href);

// 2. Surveiller les changements d’URL dynamiques (SPA)
function onUrlChange(callback) {
    let oldHref = location.href;

    const observer = new MutationObserver(() => {
        if (oldHref !== location.href) {
            oldHref = location.href;
            callback(oldHref);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const pushState = history.pushState;
    const replaceState = history.replaceState;

    history.pushState = function () {
        pushState.apply(history, arguments);
        window.dispatchEvent(new Event("locationchange"));
    };

    history.replaceState = function () {
        replaceState.apply(history, arguments);
        window.dispatchEvent(new Event("locationchange"));
    };

    window.addEventListener("popstate", () => {
        window.dispatchEvent(new Event("locationchange"));
    });

    window.addEventListener("locationchange", () => {
        callback(location.href);
    });
}

// 3. Lancer la surveillance d’URL dynamique
onUrlChange((url) => {
    verificationUrlPage(url);
});

// Fonction principale qui vérifie l'URL actuelle
function verificationUrlPage(url) {
    console.log("🔄 Nouvelle URL détectée, Vérification du type de page :", url);
    divContainer.innerHTML = '';
    if (url.includes("/deposer-une-annonce")) {
        console.log("➡️ page de Création d'annonce !")
        actionPageCreation();
    }
    else if (url.includes('/compte/pro/mon-activite')) {
        console.log("➡️ page Mon Activité")
        actionPageActivite();
    }
    else {
        console.log("➡️ Pas d'action ici = CLEAN")
        divContainer.innerHTML = '';
    }
}

/////////// FONCTIONNALITES ///////////
function actionPageCreation() {
    chrome.storage.sync.get(["toogle_lbc_past", "lbc_copy_data"], (data) => {
        if (!data.toogle_lbc_past) return; // Ne rien faire si désactivé

        console.log("🔄 Ajout du bouton Coller Data");

        const bouton = document.createElement('span');
        bouton.className = "btn-swap";
        bouton.innerText = "Coller data";
        divContainer.appendChild(bouton);
        bouton.addEventListener('click', () => {
            chrome.storage.sync.get("lbc_copy_data", (data) => {
                if (data.lbc_copy_data == "" || !data.lbc_copy_data) return; // Ne rien faire si vide OU non défini
                console.log("✅ Données récupéré depuis le stockage :", data.lbc_copy_data);

                const champTexteTitre = document.querySelector('input[name="subject"]');
                if (champTexteTitre) {
                    champTexteTitre.value = "";
                    simulateTyping(champTexteTitre, data.lbc_copy_data.name);
                }
                const champDescription = document.querySelector('textarea[id="body"][name="body"]');
                if (champDescription) {
                    champDescription.textContent = "";
                    const description = `Garantie de 6 mois
\-\-
Pour plus de renseignements, merci de contacter directement un vendeur de la boutique par téléphone.
Vous pouvez passer commande en ligne sur notre site internet (ConceptStorePhoto). ref ${data.lbc_copy_data.aicm}
\-\-
Retrouvez toutes nos offres sur notre site internet et dans nos boutiques Concept Store Photo à Nantes, Rennes et Vannes`
                    simulateTyping(champDescription, description);
                }
                const champRef = document.querySelector('input[id="custom_ref"]');
                if (champRef) {
                    champRef.value = "";
                    simulateTyping(champRef, data.lbc_copy_data.aicm);
                }
                const champPrix = document.querySelector('input[id="price_cents"]');
                if (champPrix) {
                    champPrix.value = "";
                    simulateTyping(champPrix, data.lbc_copy_data.prix);
                }
                const champEtat = document.querySelector('div[data-rhf-name="condition"] input');
                const champUnivers = document.querySelector('div[data-rhf-name="image_sound_universe"] input');
                const champProduit = document.querySelector('div[data-rhf-name="image_sound_product"] input');
                const champMarque = document.querySelector('div[data-rhf-name="image_sound_brand"] input');
                if (champEtat && champUnivers && champProduit && champMarque)
                    runSequence();

                async function runSequence() {
                    champEtat.value = '';
                    champEtat.focus();
                    simulateKeyPress(champEtat, "ArrowDown");
                    simulateKeyPress(champEtat, "ArrowDown");
                    simulateKeyPress(champEtat, "ArrowDown");
                    simulateKeyPress(champEtat, "ArrowDown");
                    await sleep(10);
                    simulateKeyPress(champEtat, "Enter");
                    // await sleep(10);

                    champUnivers.value = "";
                    champUnivers.focus();
                    simulateKeyPress(champUnivers, "ArrowDown");
                    await sleep(10);
                    simulateKeyPress(champUnivers, "Enter");

                    champMarque.value = "";
                    champMarque.focus();
                    for (const test of testMarques) {
                        const regex = new RegExp(test.regex, "i");
                        if (regex.test(data.lbc_copy_data.name.slice(0, 15).toUpperCase())) {
                            console.log("➡️ Test marque : ", data.lbc_copy_data.name, " ➡️ ", test.marque);
                            simulateTyping(champMarque, test.marque);
                            await sleep(200);
                            simulateKeyPress(champMarque, "ArrowDown");
                            await sleep(10);
                            simulateKeyPress(champMarque, "Enter");
                        }
                    }

                    champProduit.value = '';
                    champProduit.focus();
                    for (const test of testCategorie) {
                        const regex = new RegExp(test.regex, "i"); // "i" pour ignorer la casse
                        if (regex.test(data.lbc_copy_data.name)) {
                            console.log("➡️ Test catégorie : ", data.lbc_copy_data.name, " ➡️ ", test.categorie);
                            simulateTyping(champProduit, test.categorie);
                            await sleep(200);
                            simulateKeyPress(champProduit, "ArrowDown");
                            await sleep(10);
                            simulateKeyPress(champProduit, "Enter");
                        }
                    }


                }

                const testCategorie = [
                    {
                        regex: "EXTENDER|TELECONVERTER|BAGUE|FLASH|FTZ|PROFOTO|GRIP",
                        categorie: "Accessoires"
                    },
                    {
                        regex: "XF \\d{1,}|EF \\d{1,}|RF \\d{1,}|AF \\d{1,}|FE \\d{1,}|Z \\d{1,}|SL \\d{1,}|\\d+-\\d+|\\d+ [F]?\\d+(\\.\\d+)?|SUMMILUX|SUMMICRON",
                        categorie: "Objectifs"
                    },
                    {
                        regex: "FUJIFILM X-|FUJI X-|NIKON D\\d{1,}",
                        categorie: "Appareil photos"
                    }
                ];

                const testMarques = [
                    { regex: "SIGMA", marque: "Sigma" },
                    { regex: "TAMRON", marque: "Tamron" },
                    { regex: "SAMYANG", marque: "Samyang" },
                    { regex: "CANON", marque: "Canon" },
                    { regex: "NIKON", marque: "Nikon" },
                    { regex: "PENTAX", marque: "Pentax" },
                    { regex: "LEICA", marque: "Leica" },
                    { regex: "LAOWA", marque: "Laowa" },
                    { regex: "FUJIFILM|FUJI|XF", marque: "Fujifilm" },
                    { regex: "GODOX", marque: "Godox" },
                    { regex: "PANASONIC|LUMIX", marque: "Panasonic" },
                    { regex: "SONY", marque: "Sony" },
                    { regex: "OLYMPUS", marque: "Olympus" },
                    { regex: "PROFOTO", marque: "Profoto" },
                    { regex: "\\bRF\\b", marque: "Canon" },        // correspond à " RF "
                    { regex: "\\bAF\\b|AF-S", marque: "Nikon" }    // correspond à " AF " ou "AF-S"
                ];


                // console.log("➡️ Test catégorie : ", trouverCategorie(data.lbc_copy_data.name));

            });

        });

    });


    chrome.storage.sync.get("toogle_lbc_adress", (data) => {
        if (!data.toogle_lbc_adress) return; // Ne rien faire si désactivé

        console.log("🔄 Ajout boutons Adresse");

        const adress = [
            { name: "Nantes", adress: "2 Place de la Petite Hollande, 44000 Nantes", tel: "0240696136" },
            { name: "Rennes", adress: "4 rue du pré botté, 35000 Rennes", tel: "0299792340" },
            { name: "Vannes", adress: "3 place Lucien Laroche, 56000 Vannes", tel: "0297543881" }
        ];

        adress.forEach((entry) => {
            const btn = document.createElement('span');
            btn.className = "btn-swap";
            btn.innerText = `Adresse : ${entry.name}`;
            btn.style.backgroundColor = ' #2029ad';
            btn.addEventListener('click', () => {
                const champAdresse = document.querySelector('input[name="location"]');
                if (champAdresse) {
                    champAdresse.value = "";
                    simulateTyping(champAdresse, entry.adress);
                    setTimeout(() => {
                        simulateKeyPress(champAdresse, "ArrowDown");
                        simulateKeyPress(champAdresse, "Enter");

                        const champTel = document.querySelector('input[name="phone"]');
                        if (champTel) {
                            champTel.value = "";
                            simulateTyping(champTel, entry.tel);
                        }
                    }, 1000);
                }
            });
            divContainer.appendChild(btn);
        });


    });
}

function actionPageActivite() {

    chrome.storage.sync.get("toogle_lbc_activite_copy_ref", (data) => {
        if (!data.toogle_lbc_activite_copy_ref) return; // Ne rien faire si désactivé

        const observer = new MutationObserver((mutations, obs) => {
            const rows = document.querySelectorAll('tr[data-test-id="list-item"] p.truncate');
            if (rows.length > 0) {
                // On a trouvé les lignes, on arrête l'observation
                obs.disconnect();

                // Traitement des références
                rows.forEach(el => {
                    console.log("🔄 Ajout des boutons de copie de la référence");

                    // Évite d'ajouter le bouton plusieurs fois
                    if (el.querySelector("button.copier-btn")) return;

                    // Vérifie que l'élément a du texte
                    if (!el.innerText || el.innerText.trim() === "") return;

                    const text = el.innerText;
                    const bouton = document.createElement("button");
                    bouton.innerText = "📋";
                    bouton.className = "copier-btn";
                    bouton.style.margin = "4px 8px";
                    bouton.style.borderRadius = "10px";
                    bouton.style.border = "none";
                    bouton.style.outline = "none";
                    bouton.style.backgroundColor = "#e7e7e7";
                    bouton.style.padding = "4px 8px";
                    bouton.onclick = (event) => {
                        event.preventDefault();
                        event.stopPropagation(); // évite les comportements attachés ailleurs
                        navigator.clipboard.writeText(text).then(() => {
                            bouton.innerText = "✅";
                            setTimeout(() => (bouton.innerText = "📋"), 1500);
                        });
                    };
                    el.append(bouton);
                });
            }
        });

        // Observer le body ou un conteneur spécifique
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });


}


/////////// FONCTION ///////////

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// function trouverCategorie(nomProduit) {
//     const testProduit = [
//         {
//             regex: "EXTENDER|TELECONVERTER|BAGUE|FLASH|FTZ|PROFOTO|GRIP",
//             categorie: "Accessoires"
//         },
//         {
//             regex: "XF \\d{1,}|EF \\d{1,}|RF \\d{1,}|AF \\d{1,}|FE \\d{1,}|Z \\d{1,}|SL \\d{1,}|\\d+-\\d+|\\d+ [F]?\\d+(\\.\\d+)?|SUMMILUX|SUMMICRON",
//             categorie: "Objectifs"
//         },
//         {
//             regex: "FUJIFILM X-|FUJI X-|NIKON D\\d{1,}",
//             categorie: "Appareil photos"
//         }
//     ];
//     for (const test of testProduit) {
//         const regex = new RegExp(test.regex, "i"); // "i" pour ignorer la casse
//         if (regex.test(nomProduit)) {
//             return test.categorie;
//         }
//     }
//     return "Catégorie inconnue";
// }


// function trouverMarque(nomProduit) {
//   const debut = nomProduit.slice(0, 15).toUpperCase();

//   for (const test of testMarques) {
//     const regex = new RegExp(test.regex, "i");
//     if (regex.test(debut)) {
//       return test.marque;
//     }
//   }

//   return "Marque inconnue";
// }

