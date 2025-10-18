console.log("✅ Script injecté !  functions/function-product-tagOffre.js");

chrome.storage.sync.get("toggle_product_EncartOffre_TagOffre", (data) => {
    if (data.toggle_product_EncartOffre_TagOffre) {
        console.log("✅ toggle_product_EncartOffre_TagOffre activé");
        initCustomOfferTagFeature();
    }
});

function initCustomOfferTagFeature() {
    const PREFIXconsole = "tagOffre";
    const OFFER_LABEL = "Offre";
    const PRICE_FIELD_ID = "product_pricing_offer_tag";
    const PLACEHOLDER = "Tag custom";
    const ORANGE = "#f7c261";
    const containerSelector = "#product_details_features_feature_values";
    const buttonAddSpecs = document.getElementById('product_details_features_add_feature');
    const featuresContainer = document.querySelector(containerSelector);

    let isSyncing = false;
    let isComposing = false;

    // Pour IME / saisie accentuée
    document.addEventListener('compositionstart', () => isComposing = true);
    document.addEventListener('compositionend', () => isComposing = false);

    if (!buttonAddSpecs || !featuresContainer) {
        console.log(`[${new Date().toLocaleString()}] ❌ ${PREFIXconsole}: éléments introuvables (buttonAddSpecs ou featuresContainer).`);
        return;
    }

    // --- CSS pour background orange ---
    const style = document.createElement('style');
    style.textContent = `.product-feature.offer-custom-highlight { background-color: ${ORANGE} !important; border-radius:4px; padding:6px; } #${PRICE_FIELD_ID} { margin-top: .5rem; } `;
    document.head.appendChild(style);

    // --- Ajout du bouton "Ajouter le tag custom" ---
    function addCustomOfferButton() {
        if (document.getElementById('CSP_tools-add-offer-tag-btn')) return;

        const btn = document.createElement('button');
        btn.type = "button";
        btn.id = "CSP_tools-add-offer-tag-btn";
        btn.className = 'btn btn-outline-primary ml-2';
        btn.style.backgroundColor = ORANGE;
        btn.style.color = "#000";
        btn.textContent = "Ajouter le Tag Custom";
        btn.addEventListener('click', () => {
            createOrUpdateOfferFromPriceField();
        });

        buttonAddSpecs.parentNode.appendChild(btn);
    }

    // --- Ajout du champ texte dans l'onglet Prix ---
    function addPriceField() {
        if (document.getElementById(PRICE_FIELD_ID)) return;

        const insertAfter = document.querySelector('#product_pricing_offer_date')?.parentElement;
        if (!insertAfter) {
            console.warn(`${PREFIXconsole}: point d'insertion introuvable`);
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        wrapper.innerHTML = `
            <h4 class="form-control-label">Texte Tag Offre Custom</h4>
            <p>Génère automatiquement la caractéristique dans l'onglet détails</p>
            <input type="text" id="${PRICE_FIELD_ID}" class="form-control" placeholder="${PLACEHOLDER}" />
        `;
        wrapper.style.padding = "10px ";
        wrapper.style.borderRadius = "6px ";
        wrapper.style.backgroundColor = ORANGE;

        insertAfter.parentNode.insertBefore(wrapper, insertAfter.nextSibling);

        const priceInput = document.getElementById(PRICE_FIELD_ID);
        priceInput.addEventListener('change', onPriceFieldInput);
    }

    // --- Détection de la ligne Offre ---
    function findOfferRow() {
        const rows = document.querySelectorAll('#product_details_features_feature_values .product-feature');
        for (const row of rows) {
            const select = row.querySelector('.feature-selector');
            if (!select) continue;
            const selectedText = select.options[select.selectedIndex]?.textContent?.trim();
            if (selectedText === OFFER_LABEL) return row;

            const rendered = row.querySelector('.select2-selection__rendered');
            if (rendered && rendered.textContent.trim() === OFFER_LABEL) return row;
        }
        return null;
    }

    // --- Highlight de la ligne Offre ---
    function highlightOfferRow(row) {
        if (!row) return;
        row.classList.add('offer-custom-highlight');
        const input = row.querySelector('input[type="text"]');
        if (input) input.placeholder = PLACEHOLDER;
    }

    // --- Supprimer la ligne Offre ---
    function removeOfferRow(row) {
        if (!row) return;
        row.remove();
    }

    // --- Créer ou mettre à jour la ligne Offre ---
    function createOrUpdateOfferRow(customText) {
        const existing = findOfferRow();
        if (existing) {
            const customInput = existing.querySelector('.js-locale-input input[type="text"]');
            if (customInput) {
                customInput.value = customText || "";
                customInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            highlightOfferRow(existing);
            return existing;
        }

        buttonAddSpecs.click();
        setTimeout(() => {
            const featureBlocks = document.querySelectorAll('.product-feature');
            const lastBlock = featureBlocks[featureBlocks.length - 1];

            const selectFeature = lastBlock.querySelector('.feature-selector');
            if (selectFeature) {
                const matchingOption = [...selectFeature.options].find(opt => opt.textContent.trim() === OFFER_LABEL);
                if (matchingOption) {
                    selectFeature.value = matchingOption.value;
                    selectFeature.dispatchEvent(new Event('change', { bubbles: true }));
                } else {
                    console.warn(`[${new Date().toLocaleString()}] ${PREFIXconsole}: Caractéristique introuvable : ${OFFER_LABEL}`);
                    displayNotif(`⚠️ Caractéristique introuvable : ${OFFER_LABEL}`);
                }
            }

            const input = lastBlock.querySelector('input[type="text"]');
            if (input) {
                input.value = customText || "";
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            attachFeatureCustomInputListener(lastBlock);
            highlightOfferRow(lastBlock);
        }, 50);
    }

    // --- Synchronisation Prix → Feature ---
    function onPriceFieldInput(e) {
        if (isSyncing || isComposing) return;
        isSyncing = true;

        const val = e.target.value;
        const row = findOfferRow();

        if (!val && row) {
            removeOfferRow(row);
        } else if (val) {
            createOrUpdateOfferRow(val);
        }

        isSyncing = false;
    }

    // --- Synchronisation Feature → Prix ---
    function attachFeatureCustomInputListener(row) {
        if (!row) return;
        const customInput = row.querySelector('.js-locale-input input[type="text"]');
        if (!customInput) return;

        if (customInput.dataset.offerListenerAttached) return;
        customInput.dataset.offerListenerAttached = "1";

        customInput.addEventListener('change', () => {
            if (isSyncing || isComposing) return;
            isSyncing = true;

            const priceInput = document.getElementById(PRICE_FIELD_ID);
            if (priceInput && priceInput.value !== customInput.value) {
                priceInput.value = customInput.value;
                priceInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            isSyncing = false;
        });
    }

    // --- Initialisation de la ligne déjà existante ---
    function tryInitFeatureRow(row) {
        const select = row.querySelector('.feature-selector');
        const selectedText = select?.options[select.selectedIndex]?.textContent?.trim();
        if (selectedText === OFFER_LABEL) {
            highlightOfferRow(row);
            attachFeatureCustomInputListener(row);

            const customInput = row.querySelector('.js-locale-input input[type="text"]');
            const priceInput = document.getElementById(PRICE_FIELD_ID);
            if (customInput && priceInput && customInput.value && priceInput.value !== customInput.value) {
                priceInput.value = customInput.value;
            }
        }
    }

    // --- Surveillance select feature pour ajout manuel de Offre ---
    document.addEventListener('change', (e) => {
        const target = e.target;
        if (!target.classList.contains('feature-selector')) return;

        const selectedText = target.options[target.selectedIndex]?.textContent?.trim();
        const row = target.closest('.product-feature');

        if (selectedText === OFFER_LABEL) {
            tryInitFeatureRow(row);
        } else if (row && row.classList.contains('offer-custom-highlight')) {
            row.classList.remove('offer-custom-highlight');
        }
    }, true);

    // --- Créer / mettre à jour depuis champ Prix ---
    function createOrUpdateOfferFromPriceField() {
        const priceInput = document.getElementById(PRICE_FIELD_ID);
        const value = priceInput ? priceInput.value : "";
        createOrUpdateOfferRow(value);
    }

    // --- Initialisation globale ---
    function init() {
        addCustomOfferButton();
        addPriceField();

        document.querySelectorAll('#product_details_features_feature_values .product-feature').forEach(tryInitFeatureRow);
    }

    init();
}
