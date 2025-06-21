console.log("✅ Script injecté !  content-LBC.js");

chrome.storage.sync.get(["toogle_lbc_past", "lbc_copy_data"], (data) => {
    if (!data.toogle_lbc_past) return; // Ne rien faire si désactivé

    // if (data.lbc_copy_data == "" || !data.lbc_copy_data) return; // Ne rien faire si vide OU non défini
    // console.log("✅ Données récupéré depuis le stockage :", data.lbc_copy_data);


    // console.log("🔄 Vérification du type de page : ", window.location.pathname);
    // if (!window.location.pathname.startsWith("/deposer-une-annonce")) return;

    console.log("🔄 Ajout du bouton Coller");

    const bouton = document.createElement('span');
    bouton.className = "btn-swap";
    bouton.innerText = "Coller";
    const style = document.createElement('style');
    style.textContent = `
                .btn-swap {
                    font-size: 16px;
                    padding: 8px 15px;
                    background-color: #007bff;
                    color: #fff;
                    border-radius: 5px;
                    text-decoration: none;
                    margin-left: 20px;
                    margin-top: 25px;
                    height: fit-content;
                    cursor: pointer;
                    position: fixed;
                    top:50px;
                    right:10px;
                    z-index:99999;
                }

                .btn-swap:hover {
                    background-color: #0056b3;
                }
            `;
    document.head.appendChild(style);
    document.body.appendChild(bouton);
    bouton.addEventListener('click', () => {
        chrome.storage.sync.get("lbc_copy_data", (data) => {
            if (data.lbc_copy_data == "" || !data.lbc_copy_data) return; // Ne rien faire si vide OU non défini
            console.log(data.lbc_copy_data)

            const champTexteTitre = document.querySelector('input[name="subject"]');
            champTexteTitre.value = data.lbc_copy_data.name;
            champTexteTitre.dispatchEvent(new Event('input'));
            champTexteTitre.dispatchEvent(new Event('change'));

            const champDescription = document.querySelector('textarea[id="body"][name="body"]');
            if (champDescription) {
                champDescription.textContent = `Garantie de 6 mois
\-\-
Pour plus de renseignements, merci de contacter directement un vendeur de la
boutique par téléphone.
Vous pouvez passer commande en ligne sur notre site internet (ConceptStorePhoto). ref ${data.lbc_copy_data.aicm}
\-\-
Retrouvez toutes nos offres sur notre site internet et dans nos boutiques Concept
Store Photo à Nantes, Rennes et Vannes`;
                champDescription.dispatchEvent(new Event('input'));
                champDescription.dispatchEvent(new Event('change'));
            }
            const champRef = document.querySelector('input[id="custom_ref"]');
            if (champRef) {
                champRef.value = data.lbc_copy_data.aicm;
                champRef.dispatchEvent(new Event('input'));
                champRef.dispatchEvent(new Event('change'));
            }
            const champPrix = document.querySelector('input[id="price_cents"]');
            if (champPrix) {
                champPrix.value = data.lbc_copy_data.prix;
                champPrix.dispatchEvent(new Event('input'));
                champPrix.dispatchEvent(new Event('change'));
            }
        });


    });



});