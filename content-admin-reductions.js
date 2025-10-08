console.log("✅ Script injecté !  content-admin-reductions.js");



//// Lance l'injection DE TOUT par lot de 10 
// injectSubtitles(10);


// const select = document.querySelector('#product_rule_select_1_1_1');
// if (!select) console.warn("❌ Select introuvable.");
// const options = select.querySelectorAll('option');
// console.log(options);
// options.forEach(opt => {
//     opt.addEventListener('click', () => {
//         const productId = opt.value.trim();
//         console.log('Recherche sous-titre pour ID:', productId);
//         if (!productId || isNaN(productId)) return;
//         getSubtitle(productId, subtitle => {
//             console.log(`[${productId}] → ${subtitle}`);
//             if (subtitle && subtitle !== "false") {
//                 const span = document.createElement("span");
//                 span.innerText = ` – ${subtitle}`;
//                 span.style.fontStyle = "italic";
//                 span.style.color = "#666";
//                 // const current = opt.textContent.trim();
//                 // opt.innerHTML = `${current}`;
//                 opt.appendChild(span);
//             }
//         });
//     });
// });



const select = document.querySelector('#product_rule_select_1_1_1');
if (!select) {
    console.warn("❌ Select introuvable (#product_rule_select_1_1_1) introuvable.");
} else {
    const options = Array.from(select.querySelectorAll('option'));

    options.forEach((opt, index) => {
        opt.addEventListener('click', () => {
            const productId = opt.value.trim();
            if (!productId || isNaN(productId)) return;

            // plage d’options à traiter
            const start = Math.max(0, index - 10);
            const end = Math.min(options.length, index + 11);
            const nearbyOptions = options.slice(start, end);

            console.log(`🔍 Chargement des sous-titres de ${start} à ${end - 1}`);

            nearbyOptions.forEach(o => {
                const id = o.value.trim();
                if (!id || isNaN(id)) return;

                // évite de refaire les fetchs
                if (o.dataset.subtitleLoaded === "1") return;

                getSubtitle(id, subtitle => {
                    if (!subtitle || subtitle === "false") {
                        o.dataset.subtitleLoaded = "1"; // on marque quand même pour éviter recharges inutiles
                        return;
                    }
                    console.log(`[${productId}] → ${subtitle}`);

                    // ajoute le sous-titre visuellement
                    const span = document.createElement("span");
                    span.innerText = ` – ${subtitle}`;
                    span.style.fontStyle = "italic";
                    span.style.color = "#666";
                    o.appendChild(span);

                    // marquage pour éviter rechargement
                    o.dataset.subtitleLoaded = "1";
                    o.dataset.subtitleText = subtitle;
                });
            });
        });
    });
}




// Contrôleur d'annulation des fetch en cours lors du changement de page
const fetchController = new AbortController();
window.addEventListener("beforeunload", () => {
    fetchController.abort(); // annule toutes les requêtes en cours
});

function getSubtitle(productId, callback) {
    if (!productId) {
        console.warn(`[${new Date().toLocaleString()}] ❌ Pas d'ID produit.`);
        if (typeof callback === "function") callback(null);
        return;
    }

    const apiUrl = `${location.origin}/module/dmucustomproduct/customproduct`;
    const body = `action=get_subtitle&id_product=${encodeURIComponent(productId)}`;

    fetch(apiUrl, {
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        },
        body,
        credentials: "include",
        signal: fetchController?.signal
    })
        .then(r => r.text())
        .then(txt => callback(txt.trim() || null))
        .catch(err => {
            if (err.name !== "AbortError")
                console.error(`[${new Date().toLocaleString()}] ❌ Erreur pour ${productId} :`, err);
            callback(null);
        });
}

function getAllProductIds() {
    const select = document.querySelector('#product_rule_select_1_1_1');
    if (!select) {
        console.warn("❌ Impossible de trouver le select #product_rule_select_1_1_1");
        return [];
    }

    return Array.from(select.querySelectorAll('option'))
        .map(opt => opt.value.trim())
        .filter(v => v && !isNaN(v));
}

async function injectSubtitles(batchSize = 10) {
    displayNotif("⏳ Injection des sous-titres en cours... (ça va être très long...)", 10000);
    const select = document.querySelector('#product_rule_select_1_1_1');
    if (!select) return console.warn("❌ Select introuvable.");

    const options = Array.from(select.querySelectorAll('option'));
    const ids = options.map(o => o.value.trim()).filter(v => v && !isNaN(v));

    for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);

        await Promise.all(batch.map(id => new Promise(resolve => {
            getSubtitle(id, subtitle => {
                console.log(`[${id}] → ${subtitle}`);
                const option = options.find(o => o.value === id);
                if (option && subtitle && subtitle !== "false") {
                    // on insère le span <i>
                    const span = document.createElement("span");
                    span.innerText = ` – ${subtitle}`;
                    span.style.fontStyle = "italic";
                    span.style.color = "#666";

                    // on remplace le contenu visuel
                    const current = option.textContent.trim();
                    option.innerHTML = `${current}`;
                    option.appendChild(span);
                }
                resolve();
            });
        })));
    }

    console.log("✅ Sous-titres injectés dans toutes les options.");
    if (typeof displayNotif === "function") displayNotif("✅ Sous-titres injectés !");
}


/////////////////
function displayNotif(message, duree) {
    duree = duree || 2500;
    // Vérifie si le conteneur existe déjà
    let container = document.getElementById('CSP_tools-notif-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'CSP_tools-notif-container';
        document.body.appendChild(container);

        // Injecte le CSS si pas déjà présent
        if (!document.getElementById('CSP_tools-notif-style')) {
            const style = document.createElement('style');
            style.id = 'CSP_tools-notif-style';
            style.textContent = `
              #CSP_tools-notif-container {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 9999;
                pointer-events: none;
              }

              .CSP_tools-custom-notif {
                background-color: #323232;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                opacity: 0;
                transform: translateY(-10px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: none;
              }

              .CSP_tools-custom-notif.show {
                opacity: 1;
                transform: translateY(0);
              }
            `;
            document.head.appendChild(style);
        }
    }
    // Si une notification avec le même message existe déjà, on ne fait rien
    if (document.querySelector('.CSP_tools-custom-notif')?.textContent === message) return;

    // Crée une notification individuelle
    const notif = document.createElement('div');
    notif.className = 'CSP_tools-custom-notif';
    notif.textContent = message;
    container.appendChild(notif);

    // Animation d'apparition
    setTimeout(() => notif.classList.add('show'), 10);

    // Disparition au bout de 2.5 secondes
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, duree);
}