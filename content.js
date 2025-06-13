console.log("✅ Script injecté !");

function ajouterBoutons() {
    const elements = document.querySelectorAll(".column-reference");
    elements.forEach((el) => {
        // Évite d'ajouter le bouton plusieurs fois
        if (el.querySelector("button.copier-btn")) return;
        let texte = el.innerText;

        const bouton = document.createElement("button");
        bouton.innerText = "📋";
        bouton.className = "copier-btn";
        bouton.style.marginLeft = "8px";
        bouton.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation(); // évite les comportements attachés ailleurs
            navigator.clipboard.writeText(texte).then(() => {
                bouton.innerText = "✅";
                setTimeout(() => (bouton.innerText = "📋"), 1500);
            });
        };

        el.appendChild(bouton);
    });
}

// MutationObserver pour suivre les changements du DOM
const observer = new MutationObserver(ajouterBoutons);
observer.observe(document.body, { childList: true, subtree: true });

// Exécution initiale
ajouterBoutons();
