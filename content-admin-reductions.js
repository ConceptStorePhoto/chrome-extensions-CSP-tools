console.log("✅ Script injecté !  content-admin-reductions.js");

const select2 = document.querySelector('#product_rule_select_1_1_2');
const select = document.querySelector('#product_rule_select_1_1_1');

attachSubtitleLoader(select);
attachSubtitleLoader(select2);

function attachSubtitleLoader(select) {
    if (!select) return console.warn(`[${new Date().toLocaleString()}] ❌ Select introuvable introuvable.`, select);
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
            displayNotif(`🔍 Chargement des sous-titres de ${start} à ${end - 1}`);

            nearbyOptions.forEach(o => {
                const id = o.value.trim();
                if (!id || isNaN(id)) return;

                // évite de refaire les fetchs
                if (o.dataset.subtitleLoaded === "1") return;

                getSubtitle(id, subtitle => {
                    console.log(`[${productId}] → ${subtitle}`);
                    if (!subtitle || subtitle === "false") {
                        o.dataset.subtitleLoaded = "1"; // on marque quand même pour éviter recharges inutiles
                        return;
                    }

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
            displayNotif(`✅ Chargement des sous-titres de ${start} à ${end - 1} terminé !`);
        });
    });
}


// Contrôleur d'annulation des fetch en cours lors du changement de page
const fetchController = new AbortController();
window.addEventListener("beforeunload", () => {
    fetchController.abort(); // annule toutes les requêtes en cours
});

// LES FONCTIONS SONT INJECTÉ VIA D'AUTRE SCRIPT : functions/function-getSubtitle.js
