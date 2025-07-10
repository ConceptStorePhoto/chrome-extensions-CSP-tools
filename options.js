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

                // fonction pour gérer les toogles
                const toggleButtons = document.querySelectorAll('.toggle-button');
                toggleButtons.forEach(button => {
                    const id = button.id;
                    const groupe = button.dataset.groupe;

                    // Charger l'état actuel pour chaque bouton
                    chrome.storage.sync.get(id, (data) => {
                        button.checked = !!data[id];
                    });

                    // Mise à jour de l'état 
                    button.addEventListener('change', () => {
                        // Si le bouton fait partie d'un groupe
                        if (groupe && button.checked) {
                            // Désactiver les autres boutons du même groupe
                            toggleButtons.forEach(other => {
                                if (other !== button && other.dataset.groupe === groupe && other.checked) {
                                    other.checked = false;
                                    other.dispatchEvent(new Event('change'));
                                }
                            });
                        }
                        chrome.storage.sync.set({ [button.id]: button.checked }, () => {
                            chrome.runtime.sendMessage({ type: "updateContextMenu" });
                        });
                    });
                });

            } else {
                document.querySelector('.mainContainer').textContent = 'Contenu introuvable';
            }
        }).catch(error => {
            console.error('Erreur lors du chargement :', error);
        });


});
