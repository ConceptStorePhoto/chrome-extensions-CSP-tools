console.log("✅ Script injecté !  functions/function-createPresetSystem.js");

// Utilise bootstrap dans prestashop

function createPresetSystem(config) {
    const {
        doc = document,              // Document (utile si iframe)
        inputs,                      // Tableau des inputs à gérer [{el, key}]
        targetElement,               // Élément après lequel injecter le conteneur
        storageKey,                  // Clé localStorage
        nbValeurMax = 4,             // Nombre max de presets
        formatButtonText,            // Fonction qui reçoit l’item et renvoie le texte du bouton
        applyPresetFn,               // Fonction qui applique les valeurs aux inputs
        saveButtonLabel = "💾 Sauvegarder",
        saveButtonTitle = "Sauvegarder les valeurs actuelles dans un preset",
        infoText,                    // optionnel
    } = config;

    if (!inputs?.length || !targetElement || !storageKey) return;

    // --- Injecter CSS commun une seule fois ---
    if (!doc.querySelector("#preset-style")) {
        const style = doc.createElement("style");
        style.id = "preset-style";
        style.textContent = `
            .preset-buttons { margin: 10px 0; border-radius: 5px; }
            .preset-buttons button { margin-right: 5px; white-space: pre-line; margin-bottom: 5px;}
            .preset-info { margin-bottom: 4px; }
            #preset-context-menu {
                position: absolute;
                background: white;
                border: 1px solid #ccc;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                z-index: 9999;
                padding: 5px 0;
                min-width: 120px;
                font-size: 14px;
            }
            #preset-context-menu div {
                padding: 5px 10px;
                cursor: pointer;
            }
            #preset-context-menu div:hover {
                background: #f0f0f0;
            }
        `;
        doc.head.appendChild(style);
    }

    // --- Charger historique ---
    let history = JSON.parse(localStorage.getItem(storageKey) || "[]");
    console.log("📥 Historique chargé :", history);

    // --- Conteneur ---
    let container = doc.createElement("div");
    container.className = "preset-buttons";
    targetElement?.insertAdjacentElement("afterend", container);

    // Info (optionnel)
    let infoEl = null;
    if (infoText) {
        const infoId = `preset-info-${storageKey.replace(/\W+/g, "_")}`;
        infoEl = doc.querySelector(`#${infoId}`);
        if (!infoEl) {
            infoEl = doc.createElement("p");
            infoEl.id = infoId;
            infoEl.className = "preset-info";
            infoEl.textContent = infoText;
            targetElement.insertAdjacentElement("afterend", infoEl);
        }
    }

    function saveHistory(values, name) {
        if (Object.values(values).every(v => !v)) return;

        const exists = history.find(h =>
            Object.keys(values).every(k => h[k] === values[k])
        );
        if (exists) {
            console.log("⚠️ Preset déjà existant, pas d'écrasement :", exists);
            alert("❌ Ce preset existe déjà.");
            return;
        }
        if (history.length >= nbValeurMax) {
            console.log("⛔ Limite atteinte : impossible d'ajouter plus de " + nbValeurMax + " presets");
            alert("❌ Vous ne pouvez pas enregistrer plus de " + nbValeurMax + " durées.\nSupprimez-en une avant d’ajouter une nouvelle.\nClique droit > Supprimer");
            return;
        }
        history.unshift({ ...values, name: name || null });
        localStorage.setItem(storageKey, JSON.stringify(history));
        console.log("✅ Historique mis à jour :", history);
        renderButtons();
    }

    function deletePreset(index) {
        console.log("🗑️ Suppression preset :", history[index]);
        history.splice(index, 1);
        localStorage.setItem(storageKey, JSON.stringify(history));
        renderButtons();
    }

    function renamePreset(index) {
        const newName = prompt("Entrez un nom :", history[index].name || "");
        if (newName) {
            history[index].name = newName.trim();
            localStorage.setItem(storageKey, JSON.stringify(history));
            console.log("✏️ Preset renommé :", history[index]);
            renderButtons();
        }
    }

    function renderButtons() {
        container.innerHTML = "";

        // Bouton sauvegarde
        const saveBtn = doc.createElement("button");
        saveBtn.type = "button";
        saveBtn.textContent = saveButtonLabel;
        saveBtn.title = saveButtonTitle;
        saveBtn.className = "btn btn-sm btn-success";
        saveBtn.style.marginRight = "10px";
        saveBtn.addEventListener("click", () => {
            const values = {};
            inputs.forEach(({ el, key }) => values[key] = el.value?.trim());
            const autoName = values.text?.substring(0, 20) || null;
            saveHistory(values, autoName);
        });
        container.appendChild(saveBtn);

        // Presets
        history.forEach((item, idx) => {
            const btn = doc.createElement("button");
            btn.type = "button";
            // btn.className = "btn btn-sm btn-outline-primary";
            btn.textContent = formatButtonText(item);

            // --- Vérifier si date de fin passée ---
            let isExpired = false;
            if (item.fin) {
                const finDate = new Date(item.fin.replace(" ", "T")); // compatibilité YYYY-MM-DD HH:MM
                if (!isNaN(finDate) && finDate < new Date()) {
                    isExpired = true;
                }
            }
            btn.className = "btn btn-sm " + (isExpired ? "btn-outline-danger" : "btn-outline-primary");// Classe selon statut

            btn.addEventListener("click", () => applyPresetFn(item));

            btn.addEventListener("contextmenu", (e) => {
                e.preventDefault();

                doc.querySelector("#preset-context-menu")?.remove();

                const menu = doc.createElement("div");
                menu.id = "preset-context-menu";
                menu.style.top = e.pageY + "px";
                menu.style.left = e.pageX + "px";

                const renameOption = doc.createElement("div");
                renameOption.textContent = "✏️ Renommer";
                renameOption.onclick = () => { renamePreset(idx); menu.remove(); };

                const deleteOption = doc.createElement("div");
                deleteOption.textContent = "🗑️ Supprimer";
                deleteOption.onclick = () => { deletePreset(idx); menu.remove(); };

                menu.appendChild(renameOption);
                menu.appendChild(deleteOption);
                doc.body.appendChild(menu);
                doc.addEventListener("click", () => menu.remove(), { once: true });
            });

            container.appendChild(btn);
        });
    }
    renderButtons();
}