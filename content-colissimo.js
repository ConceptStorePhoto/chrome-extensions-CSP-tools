console.log("✅ Script injecté !  content-colissimo.js");

chrome.storage.sync.get("toggle_colissimo_confirm_annuler", (data) => {
    if (!data.toggle_colissimo_confirm_annuler) return; // Ne rien faire si vide ou non défini
    console.log("🔄 Ajout confirmation annulation collect colissimo");

    const observer = new MutationObserver((mutations, obs) => {
        const boutonAnnuler = document.querySelector('button[data-target="#annulationCollecteModal"]');
        // const boutonAnnuler = document.querySelector('#ewe-header-angular-colissimo-box-link');
        if (boutonAnnuler) {
            obs.disconnect();
            boutonAnnuler.setAttribute('style', 'background-color: #c51212 !important');

            // // Création d'un gestionnaire séparé pour pouvoir le retirer
            // function onClick(e) {
            //     e.preventDefault(); // Empêche le comportement par défaut (ouverture du modal)
            //     e.stopImmediatePropagation();

            //     const confirmation = confirm("Es-tu sûr de vouloir annuler cette collecte ?");

            //     if (confirmation) {
            //         // Supprime l'écouteur pour ne pas intercepter le clic suivant
            //         boutonAnnuler.removeEventListener('click', onClick, true);

            //         // Déclenche un vrai clic qui sera cette fois non intercepté
            //         boutonAnnuler.click();

            //         // remet l'écouteur apres
            //         boutonAnnuler.addEventListener('click', onClick, true);
            //     }
            // }

            // // Utilise la phase de capture pour intercepter avant les autres gestionnaires
            // boutonAnnuler.addEventListener('click', onClick, true);

        }
    });
    // Observer le body ou un conteneur spécifique
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

});