console.log("✅ Script injecté !  functions/function-getSubtitle.js");

function getSubtitle(productId, callback) {
    if (!productId) {
        console.warn(`[${new Date().toLocaleString()}] ❌ Pas d'ID produit.`);
        if (typeof callback === "function") callback(null);
        return;
    }

    const apiUrl = `${location.origin}/module/dmucustomproduct/customproduct`;
    const body = `action=get_subtitle&id_product=${encodeURIComponent(productId)}`;

    fetch(apiUrl, {
        method: "POST",
        headers: {
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        },
        body,
        credentials: "include",
        signal: fetchController?.signal
    })
        .then(r => r.text())
        .then(txt => callback(decodeUnicode(txt.trim()) || null))
        // .then(txt => {
        //     const clean = txt.trim().replace(/^"(.*)"$/, '$1') || null;
        //     callback(clean);
        // })
        .catch(err => {
            if (err.name !== "AbortError")
                console.error(`[${new Date().toLocaleString()}] ❌ Erreur pour ${productId} :`, err);
            callback(null);
        });
}

function decodeUnicode(str) {
    try {
        return JSON.parse('"' + str.replace(/"/g, '\\"') + '"');
    } catch {
        return str;
    }
}