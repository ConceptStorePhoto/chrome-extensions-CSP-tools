console.log("✅ Script injecté !  content-colissimo.js");

chrome.storage.sync.get("toggle_colissimo_confirm_annuler", (data) => {
    if (!data.toggle_colissimo_confirm_annuler) return; // Ne rien faire si vide ou non défini
    console.log("🔄 Ajout confirmation annulation collect colissimo");

    const observer = new MutationObserver((mutations, obs) => {
        const boutonAnnuler = document.getElementById('annulationCollecteButton');
        // const boutonAnnuler = document.getElementById('demandeCollecteButton'); //teste avec bouton demande
        if (boutonAnnuler && !document.getElementById('btnAnnulerCustom') && boutonAnnuler.style.display !== "none") {
            obs.disconnect();
            // boutonAnnuler.setAttribute('style', 'background-color: #c51212 !important');
            boutonAnnuler.style.display = "none";

            const customBouton = document.createElement('button');
            customBouton.id = 'btnAnnulerCustom';
            customBouton.textContent = boutonAnnuler.textContent.trim() + " ?";
            customBouton.style.backgroundColor = ' #c51212';
            customBouton.style.color = ' #ffffff';
            customBouton.style.padding = '10px 20px';
            customBouton.style.border = 'none';
            customBouton.style.width = '100%';

            boutonAnnuler.parentElement.prepend(customBouton);

            customBouton.addEventListener('click', () => {
                console.log("🔄 Bouton custom cliqué");
                boutonAnnuler.removeAttribute('style');
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