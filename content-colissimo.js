console.log("✅ Script injecté !  content-colissimo.js");

chrome.storage.sync.get("toogle_colissimo_confirm_annuler", (data) => {
    if (!data.toogle_colissimo_confirm_annuler) return; // Ne rien faire si vide ou non défini
    console.log("🔄 Ajout confirmation annulation collect colissimo");

    const observer = new MutationObserver((mutations, obs) => {
        const boutonAnnuler = document.querySelector('button[data-target="#annulationCollecteModal"]');
        if (boutonAnnuler) {
            obs.disconnect();
            boutonAnnuler.setAttribute('style', 'background-color: #c51212 !important');

            // Intercepter le clic
            boutonAnnuler.addEventListener('click', function (e) {
                e.preventDefault(); // Empêche le comportement par défaut (le clic)

                const confirmation = confirm("Es-tu sûr de vouloir annuler cette collecte ?");

                if (confirmation) {
                    // Si l'utilisateur confirme, simule un clic "réel"
                    // Supprime l'écouteur temporairement pour éviter une boucle infinie
                    boutonAnnuler.disabled = true; // éviter double clic
                    boutonAnnuler.click(); // déclenche le clic original
                }
                // Sinon, rien ne se passe
            }, true); // capture = true pour intercepter le plus tôt possible

        }
    });
    // Observer le body ou un conteneur spécifique
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

});