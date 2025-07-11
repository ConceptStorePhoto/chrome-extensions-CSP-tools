console.log("✅ Script injecté !  content-colissimo.js");

chrome.storage.sync.get("toggle_colissimo_confirm_annuler", (data) => {
    if (!data.toggle_colissimo_confirm_annuler) return; // Ne rien faire si vide ou non défini
    console.log("🔄 Ajout confirmation annulation collect colissimo");

    const observer = new MutationObserver((mutations, obs) => {
        const boutonAnnuler = document.querySelector('button[data-target="#annulationCollecteModal"]');
        // const boutonAnnuler = document.querySelector('#requestCollectionID'); //teste avec bouton demande
        if (boutonAnnuler && !document.getElementById('btnAnnulerCustom')) {
            obs.disconnect();
            // boutonAnnuler.setAttribute('style', 'background-color: #c51212 !important');
            boutonAnnuler.parentElement.style.display = "none";

            const customBouton = document.createElement('button');
            customBouton.id = 'btnAnnulerCustom';
            customBouton.textContent = boutonAnnuler.textContent.trim() + " ?";
            customBouton.style.backgroundColor = ' #c51212';
            customBouton.style.color = ' #ffffff';
            customBouton.style.padding = '10px 20px';
            customBouton.style.border = 'none';
            customBouton.style.width = '100%';

            boutonAnnuler.parentElement.parentElement.prepend(customBouton);

            customBouton.addEventListener('click', () => {
                // const confirmation = confirm("Es-tu sûr de vouloir annuler cette collecte ?");
                // if (confirmation) {
                boutonAnnuler.parentElement.style.display = "bloc";
                // }
            });
            console.log("✅ Bouton custom ajouté avec succès !");
        }
    });
    // Observer le body ou un conteneur spécifique
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

});