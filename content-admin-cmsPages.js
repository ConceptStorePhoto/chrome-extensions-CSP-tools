console.log("✅ Script injecté !  content-admin-cmsPages.js");


document.querySelectorAll('.column-link_rewrite').forEach(cell => {
    const originalText = cell.textContent.trim();
    const id = cell.previousElementSibling.textContent.trim();
    const lienPage = `${location.origin}/content/${id}-${originalText}`;
    cell.innerHTML = `<a href="${lienPage}" target="_blank">${originalText}</a>`;

    const bouton = document.createElement("button");
    bouton.innerText = "📋";
    bouton.title = "Copier le lien";
    bouton.className = "copier-btn";
    bouton.style.marginLeft = "8px";
    bouton.style.borderRadius = "10px";
    bouton.style.border = "none";
    bouton.style.outline = "none";
    bouton.style.backgroundColor = "#e7e7e7";
    bouton.style.padding = "4px 8px";
    bouton.onclick = (event) => {
        event.preventDefault();
        // event.stopPropagation(); // évite les comportements attachés ailleurs
        navigator.clipboard.writeText(lienPage).then(() => {
            bouton.innerText = "✅";
            setTimeout(() => (bouton.innerText = "📋"), 1500);
        });
    };
    cell.appendChild(bouton);
});