console.log("✅ Script injecté !  content-admin-newProduct.js");

chrome.storage.sync.get(["toggle_catalog_newProduct_shiftClick", "toggle_catalog_newProduct_invertBlock"], (data) => {
    if (data.toggle_catalog_newProduct_shiftClick) {
        ///////// SHIFT CLICK /////////
        let lastCheckedIndex = null;
        const checkboxes = Array.from(document.querySelectorAll(".column-check .sel"));
        checkboxes.forEach((checkbox, index) => {
            // On intercepte le clic sur le label
            if (checkbox) {
                checkbox.addEventListener("click", function (e) {
                    // Si shift + clic
                    if (e.shiftKey && lastCheckedIndex !== null) {
                        // e.preventDefault(); // empêcher comportement natif
                        const currentIndex = index;
                        const [start, end] = [lastCheckedIndex, currentIndex].sort((a, b) => a - b);
                        for (let i = start; i <= end; i++) {
                            checkboxes[i].checked = true;
                        }
                    }
                    lastCheckedIndex = index;
                });
            }
        });
        const style = document.createElement("style");
        style.textContent = `
                    .no-text-select {
                    user-select: none !important;
                    }
                `;
        document.head.appendChild(style);
        const table = document.querySelector("#product_grid_table");
        if (table) {
            document.addEventListener("keydown", (e) => {
                if (e.key === "Shift") table.classList.add("no-text-select");
            });
            document.addEventListener("keyup", (e) => {
                if (e.key === "Shift") table.classList.remove("no-text-select");
            });
        }
    }
    if (data.toggle_catalog_newProduct_invertBlock) {
        ///////// Changement ordre bloc /////////
        const fieldset2 = document.querySelector("#fieldset_2");
        const formPdtsnews = document.querySelector("#form-pdtsnews");

        if (fieldset2 && formPdtsnews && formPdtsnews.parentNode) {
            formPdtsnews.parentNode.insertBefore(fieldset2, formPdtsnews);
        }
    }
});