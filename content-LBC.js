console.log("✅ Script injecté !  content-LBC.js");

const style = document.createElement('style');
style.textContent = `
                .btn-swap {
                    font-size: 16px;
                    padding: 8px 15px;
                    background-color: #007bff;
                    color: #fff;
                    border-radius: 5px;
                    text-decoration: none;
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

chrome.storage.sync.get(["toogle_lbc_past", "lbc_copy_data"], (data) => {
    if (!data.toogle_lbc_past) return; // Ne rien faire si désactivé

    // if (data.lbc_copy_data == "" || !data.lbc_copy_data) return; // Ne rien faire si vide OU non défini
    // console.log("✅ Données récupéré depuis le stockage :", data.lbc_copy_data);


    // console.log("🔄 Vérification du type de page : ", window.location.pathname);
    // if (!window.location.pathname.startsWith("/deposer-une-annonce")) return;

    console.log("🔄 Ajout du bouton Coller");

    const bouton = document.createElement('span');
    bouton.className = "btn-swap";
    bouton.innerText = "Coller data";
    bouton.style.top = `70px`;
    document.body.appendChild(bouton);
    bouton.addEventListener('click', () => {
        chrome.storage.sync.get("lbc_copy_data", (data) => {
            if (data.lbc_copy_data == "" || !data.lbc_copy_data) return; // Ne rien faire si vide OU non défini
            console.log(data.lbc_copy_data)

            const champTexteTitre = document.querySelector('input[name="subject"]');
            if (champTexteTitre) {
                champTexteTitre.value = "";
                simulateTyping(champTexteTitre, data.lbc_copy_data.name);
            }

            const champDescription = document.querySelector('textarea[id="body"][name="body"]');
            if (champDescription) {
                champDescription.textContent = "";
                const description = `Garantie de 6 mois
\-\-
Pour plus de renseignements, merci de contacter directement un vendeur de la boutique par téléphone.
Vous pouvez passer commande en ligne sur notre site internet (ConceptStorePhoto). ref ${data.lbc_copy_data.aicm}
\-\-
Retrouvez toutes nos offres sur notre site internet et dans nos boutiques Concept Store Photo à Nantes, Rennes et Vannes`
                simulateTyping(champDescription, description);
                // champDescription.dispatchEvent(new Event('input'));
                // champDescription.dispatchEvent(new Event('change'));
            }
            const champRef = document.querySelector('input[id="custom_ref"]');
            if (champRef) {
                // champRef.value = data.lbc_copy_data.aicm;
                // champRef.dispatchEvent(new Event('input'));
                // champRef.dispatchEvent(new Event('change'));
                champRef.value = "";
                simulateTyping(champRef, data.lbc_copy_data.aicm);
            }
            const champPrix = document.querySelector('input[id="price_cents"]');
            if (champPrix) {
                // champPrix.value = data.lbc_copy_data.prix;
                // champPrix.dispatchEvent(new Event('input'));
                // champPrix.dispatchEvent(new Event('change'));
                champPrix.value = "";
                simulateTyping(champPrix, data.lbc_copy_data.prix);
            }

            const champUnivers = document.querySelector('div[data-rhf-name="image_sound_universe"] input');
            if (champUnivers) {
                champUnivers.value = "";
                // simulateTyping(champUnivers, "Appareil photo");
                // setTimeout(() => {
                simulateKeyPress(champUnivers, "ArrowDown");
                simulateKeyPress(champUnivers, "Enter");
                // }, 300);
            }

            const champEtat = document.querySelector('div[data-rhf-name="condition"] input');
            if (champEtat) {
                champEtat.value = '';
                champEtat.focus();
                simulateKeyPress(champEtat, "ArrowDown");
                simulateKeyPress(champEtat, "ArrowDown");
                simulateKeyPress(champEtat, "ArrowDown");
                simulateKeyPress(champEtat, "ArrowDown");
                simulateKeyPress(champEtat, "Enter");
            }

        });


    });



});


chrome.storage.sync.get("toogle_lbc_adress", (data) => {
    if (!data.toogle_lbc_adress) return; // Ne rien faire si désactivé

    console.log("🔄 Ajout boutons Adresse");

    const adress = [
        { name: "Nantes", adress: "2 Place de la Petite Hollande, 44000 Nantes", tel: "0240696136" },
        { name: "Rennes", adress: "4 rue du pré botté, 35000 Rennes", tel: "0299792340" },
        { name: "Vannes", adress: "3 place Lucien Laroche, 56000 Vannes", tel: "0297543881" }
    ];

    adress.forEach((entry) => {
        const btn = document.createElement('span');
        btn.className = "btn-swap";
        btn.innerText = `Adresse : ${entry.name}`;
        btn.style.top = `${70 + 50 + 50 * adress.indexOf(entry)}px`; // Décale chaque bouton verticalement
        btn.style.backgroundColor = ' #2029ad';
        btn.addEventListener('click', () => {
            const champAdresse = document.querySelector('input[name="location"]');
            if (champAdresse) {
                // champAdresse.focus();
                champAdresse.value = "";
                // champAdresse.dispatchEvent(new Event('input'));
                // champAdresse.dispatchEvent(new Event('change'));
                simulateTyping(champAdresse, entry.adress);
                setTimeout(() => {
                    simulateKeyPress(champAdresse, "ArrowDown");
                    simulateKeyPress(champAdresse, "Enter");

                    const champTel = document.querySelector('input[name="phone"]');
                    if (champTel) {
                        //     champTel.focus();
                        //     champTel.value = entry.tel;
                        //     champTel.dispatchEvent(new Event('input'));
                        //     champTel.dispatchEvent(new Event('change'));
                        champTel.value = "";
                        simulateTyping(champTel, entry.tel);
                    }
                }, 1000);
            }
        });
        document.body.appendChild(btn);
    });


});

function simulateTyping(selector, text) {
    const input = selector;
    if (!input) return;

    input.focus();

    for (const char of text) {
        const event = new KeyboardEvent("keydown", {
            key: char,
            code: char,
            charCode: char.charCodeAt(0),
            keyCode: char.charCodeAt(0),
            which: char.charCodeAt(0),
            bubbles: true,
            cancelable: true
        });
        input.dispatchEvent(event);
        input.value += char;

        const inputEvent = new Event("input", {
            bubbles: true,
            cancelable: true,
        });
        input.dispatchEvent(inputEvent);
    }
}

function simulateKeyPress(selector, key) {
    const event = new KeyboardEvent("keydown", {
        key: key,           // ex: "ArrowDown"
        code: key,          // ex: "ArrowDown"
        keyCode: keyMap[key], // pour compatibilité avec certains sites
        which: keyMap[key],
        bubbles: true,
        cancelable: true
    });

    if (!selector)
        document.dispatchEvent(event);
    else
        selector.dispatchEvent(event);
}
// mappage des touches vers leurs keyCodes
const keyMap = {
    ArrowDown: 40,
    ArrowUp: 38,
    ArrowLeft: 37,
    ArrowRight: 39,
    Enter: 13,
    Tab: 9
};
