console.log("✅ Script injecté !  content-admin-reductions.js");

const keys = [
    "toggle_reduction_presets",
];
chrome.storage.sync.get(keys, (data) => {
    if (data.toggle_reduction_presets) {
        setupReductionPresets();
    }
});

const select2 = document.querySelector('#product_rule_select_1_1_2');
const select = document.querySelector('#product_rule_select_1_1_1');

attachSubtitleLoader(select);
attachSubtitleLoader(select2);

function attachSubtitleLoader(select) {
    if (!select) return console.warn(`[${new Date().toLocaleString()}] ❌ Select introuvable introuvable.`, select);
    const options = Array.from(select.querySelectorAll('option'));
    options.forEach((opt, index) => {
        opt.addEventListener('click', () => {
            const productId = opt.value.trim();
            if (!productId || isNaN(productId)) return;

            // plage d’options à traiter
            const start = Math.max(0, index - 10);
            const end = Math.min(options.length, index + 11);
            const nearbyOptions = options.slice(start, end);

            console.log(`🔍 Chargement des sous-titres de ${start} à ${end - 1}`);
            displayNotif(`🔍 Chargement des sous-titres de ${start} à ${end - 1}`);

            nearbyOptions.forEach(o => {
                const id = o.value.trim();
                if (!id || isNaN(id)) return;

                // évite de refaire les fetchs
                if (o.dataset.subtitleLoaded === "1") return;

                getSubtitle(id, subtitle => {
                    console.log(`[${productId}] → ${subtitle}`);
                    if (!subtitle || subtitle === "false") {
                        o.dataset.subtitleLoaded = "1"; // on marque quand même pour éviter recharges inutiles
                        return;
                    }

                    // ajoute le sous-titre visuellement
                    const span = document.createElement("span");
                    span.innerText = ` – ${subtitle}`;
                    span.style.fontStyle = "italic";
                    span.style.color = "#666";
                    o.appendChild(span);

                    // marquage pour éviter rechargement
                    o.dataset.subtitleLoaded = "1";
                    o.dataset.subtitleText = subtitle;
                });
            });
            displayNotif(`✅ Chargement des sous-titres de ${start} à ${end - 1} terminé !`);
        });
    });
}

// LES FONCTIONS SONT INJECTÉ VIA D'AUTRE SCRIPT : 
// --> functions/function-getSubtitle.js


////////////////////////////////////////////////////////////

function setupReductionPresets() {
    console.log("⚙️ Setup Reduction Presets");


    /* eslint-disable no-console */
    console.log("🔥 Presets produits – version ULTRA STABLE (no loop, multi-popups)");

    /* -----------------------------------
       UTIL
    ----------------------------------- */
    function isProductRuleChoose(node) {
        return (
            node &&
            node.id &&
            /^product_rule_\d+_\d+_choose_content$/.test(node.id)
        );
    }

    function getAllPresets() {
        return JSON.parse(localStorage.getItem("promoPresets") || "{}");
    }

    function saveAllPresets(obj) {
        localStorage.setItem("promoPresets", JSON.stringify(obj));
    }

    function makeBtn(text, cls) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = cls;
        b.innerText = text;
        return b;
    }

    function dispatchChange(el) {
        if (!el) return;
        el.dispatchEvent(new Event("change", { bubbles: true }));
    }

    /* -----------------------------------
       DÉTECTION LEFT / RIGHT
    ----------------------------------- */
    function detectLeftRight(container) {
        const cols = Array.from(container.querySelectorAll(".col-lg-6"));
        let left, right;

        cols.forEach(col => {
            const text = (col.textContent || "").trim().toLowerCase();
            if (text.includes("non sélection")) {
                const sel = col.querySelector("select");
                if (sel) left = sel;
            } else if (text.includes("sélection")) {
                const sel = col.querySelector("select");
                if (sel) right = sel;
            }
        });

        if (!left || !right) {
            const selects = container.querySelectorAll("select");
            if (selects.length >= 2) {
                left = selects[0];
                right = selects[1];
            }
        }

        return { left, right };
    }

    /* -----------------------------------
       UI – Injection
    ----------------------------------- */
    function populatePresetSelect(sel) {
        const presets = getAllPresets();
        sel.innerHTML = "";

        const def = document.createElement("option");
        def.value = "";
        def.textContent = "— Choisir un preset —";
        sel.appendChild(def);

        Object.keys(presets).forEach(name => {
            const o = document.createElement("option");
            o.value = name;
            o.textContent = name;
            sel.appendChild(o);
        });
    }

    function injectUIInto(container) {
        if (!container || container.dataset.presetInjected === "1") return;

        container.dataset.presetInjected = "1";

        const wrapper = document.createElement("div");
        wrapper.id = "presetManager";
        wrapper.style.display = "flex";
        wrapper.style.gap = "8px";
        wrapper.style.alignItems = "center";
        wrapper.style.marginBottom = "10px";

        const selectPreset = document.createElement("select");
        selectPreset.className = "form-control";
        selectPreset.style.width = "220px";
        populatePresetSelect(selectPreset);

        const saveBtn = makeBtn("💾 Sauver sous…", "btn btn-primary");
        const loadBtn = makeBtn("📥 Charger preset", "btn btn-warning");
        const deleteBtn = makeBtn("🗑️ Supprimer preset", "btn btn-danger");

        wrapper.appendChild(selectPreset);
        wrapper.appendChild(saveBtn);
        wrapper.appendChild(loadBtn);
        wrapper.appendChild(deleteBtn);

        container.prepend(wrapper);

        saveBtn.addEventListener("click", () => handleSave(selectPreset, container));
        loadBtn.addEventListener("click", () => handleLoad(selectPreset, container));
        deleteBtn.addEventListener("click", () => handleDelete(selectPreset));

        console.log("🔧 Preset UI injectée dans", container.id);
    }

    /* -----------------------------------
       HANDLERS
    ----------------------------------- */
    function handleSave(selectElt, container) {
        const { right } = detectLeftRight(container);
        if (!right) return alert('Impossible de détecter la colonne "Sélectionnés".');

        const ids = Array.from(right.options).map(o => o.value);
        const name = prompt("Nom du preset :");
        if (!name) return;

        const presets = getAllPresets();
        presets[name] = ids;
        saveAllPresets(presets);

        // Mise à jour globale de tous les selects preset
        document.querySelectorAll("#presetManager select").forEach(populatePresetSelect);

        displayNotif(`Preset "${name}" sauvegardé (${ids.length} produits).`);
    }

    function handleLoad(selectElt, container) {
        const name = selectElt.value;
        if (!name) return alert("Choisissez un preset.");

        const presets = getAllPresets();
        const ids = presets[name] || [];
        if (!ids.length) return alert("Preset vide.");

        const { left, right } = detectLeftRight(container);
        if (!left || !right)
            return alert("Impossible de détecter les colonnes.");

        Array.from(right.options).forEach(opt => left.appendChild(opt));
        ids.forEach(id => {
            const opt = left.querySelector(`option[value="${id}"]`);
            if (opt) {
                right.appendChild(opt);
            }
        });

        dispatchChange(left);
        dispatchChange(right);

        displayNotif(`Preset "${name}" chargé (${ids.length} produits).`);
    }

    function handleDelete(selectElt) {
        const name = selectElt.value;
        if (!name) return alert("Choisissez un preset.");

        if (!confirm(`Supprimer le preset "${name}" ?`)) return;

        const presets = getAllPresets();
        delete presets[name];
        saveAllPresets(presets);

        document.querySelectorAll("#presetManager select").forEach(populatePresetSelect);

        displayNotif(`Preset "${name}" supprimé.`);
    }

    /* -----------------------------------
       MUTATION OBSERVER – ULTRA STABLE
    ----------------------------------- */

    const modalSelectors = [
        ".bootstrap-dialog",
        ".modal",
        ".ui-dialog",
        "#cart_rule_form",
        "#product_rule_group",
    ];

    function findDynamicZones() {
        return document.querySelectorAll(modalSelectors.join(","));
    }

    const observer = new MutationObserver(mutations => {
        let targetContainer = null;

        for (const m of mutations) {
            for (const n of m.addedNodes || []) {
                if (n.nodeType !== 1) continue;

                if (isProductRuleChoose(n)) {
                    targetContainer = n;
                } else {
                    const inside = n.querySelector?.('[id$="_choose_content"]');
                    if (inside && isProductRuleChoose(inside)) {
                        targetContainer = inside;
                    }
                }
            }
        }

        if (targetContainer && !targetContainer.dataset.presetInjected) {
            observer.disconnect();
            injectUIInto(targetContainer);
            startObserver();
        }
    });

    function startObserver() {
        const zones = findDynamicZones();
        zones.forEach(zone =>
            observer.observe(zone, {
                childList: true,
                subtree: true,
            })
        );
    }

    // Start
    startObserver();

    // Si déjà présent au chargement
    findDynamicZones().forEach(zone => {
        const exist = zone.querySelector('[id$="_choose_content"]');
        if (exist && isProductRuleChoose(exist)) {
            injectUIInto(exist);
        }
    });

    console.log("✅ Presets: observer actif, sans boucle infinie.");
}
