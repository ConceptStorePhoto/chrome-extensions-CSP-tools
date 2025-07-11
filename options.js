import { gestionToggle } from './functions/gestion-toggle.js';
import { gestionColorInput } from './functions/gestion-color-input.js';

document.addEventListener("DOMContentLoaded", () => {

    // Charger le contenu de popup.html
    fetch('popup.html')
        .then(response => response.text())
        .then(html => {
            // Créer un document temporaire
            const doc = new DOMParser().parseFromString(html, 'text/html');

            // Récupérer un élément spécifique depuis page1
            const contenu = doc.querySelector('#mainContainer'); // adapte l'ID à ton cas

            if (contenu) {
                document.querySelector('.mainContainer').innerHTML = contenu.innerHTML;

                document.querySelectorAll('.mainContainer .hide').forEach(element => {
                    element.classList.remove('hide');
                });;

                gestionToggle();
                gestionColorInput();

            } else {
                document.querySelector('.mainContainer').textContent = 'Contenu introuvable';
            }
        }).catch(error => {
            console.error('Erreur lors du chargement :', error);
        });


});
