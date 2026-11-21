console.log("✅ Script injecté ! content-admin-creativeElements.js");

// Contrôleur d'annulation des fetch en cours lors du changement de page
const fetchController = new AbortController();
window.addEventListener("beforeunload", () => {
    fetchController.abort(); // annule toutes les requêtes en cours
});
// LES FONCTIONS SONT INJECTÉ VIA D'AUTRE SCRIPT


console.log("Code content-admin-creativeElements.js en commentaire désactiver car ne peut pas fonctionner sans l'id du produit, et il n'est pas sur la page ")

// // ---------------- utilitaires ----------------
// function extractRefId(text) {
//   if (!text) return null;
//   const m = text.match(/\(ref:\s*([^)]+)\)/);
//   return m ? m[1].trim() : null;
// }

// function safeTextOfSpan(elem) {
//   const span = elem.querySelector('span') || elem.querySelector('.elementor-control-field span');
//   return span ? (span.title || span.textContent || span.innerText) : elem.textContent;
// }

// // ---------------- traitement d'un élément ----------------
// function processElement(elem) {
//   if (!elem || elem.dataset.subtitleLoaded === "1" || elem.dataset.subtitleLoading === "1") return;
//   const text = safeTextOfSpan(elem);
//   const id = extractRefId(text);
//   if (!id) return;

//   // marque en cours pour éviter double appel
//   elem.dataset.subtitleLoading = "1";

//   try {
//     // getSubtitle doit exister dans ton scope ; on protège le callback
//     getSubtitle(id, subtitle => {
//       try {
//         // remplacer "o" par "elem" (bug fréquent)
//         elem.dataset.subtitleLoaded = "1";
//         elem.dataset.subtitleText = subtitle ? String(subtitle) : "";
//         delete elem.dataset.subtitleLoading;
//         console.log(`📌 [${id}] → subtitle="${subtitle}" (marqué sur l'élément)`);
//         // Si tu veux l'afficher visuellement, décommenter ci-dessous :
//         // if (subtitle && subtitle !== "false") {
//         //   const s = document.createElement('span');
//         //   s.textContent = ` – ${subtitle}`;
//         //   s.style.fontStyle = 'italic';
//         //   s.style.color = '#666';
//         //   elem.appendChild(s);
//         // }
//       } catch (err2) {
//         console.error("Erreur dans le callback getSubtitle:", err2);
//       }
//     });
//   } catch (err) {
//     console.error("getSubtitle a levé une exception:", err);
//     // nettoie pour permettre réessai ultérieur
//     delete elem.dataset.subtitleLoading;
//   }
// }

// // ---------------- observer spécifique pour Select2 ----------------
// let select2ObserverAttached = false;
// const select2Observer = new MutationObserver(mutations => {
//   mutations.forEach(m => {
//     if (m.type === 'childList') {
//       m.addedNodes.forEach(node => {
//         if (node.nodeType !== 1) return;
//         if (node.matches && node.matches('.select2-results__option')) processElement(node);
//         node.querySelectorAll && node.querySelectorAll('.select2-results__option').forEach(processElement);
//       });
//     }
//     if (m.type === 'characterData') {
//       // texte changé : chercher le parent .select2-results__option le plus proche
//       const parent = m.target.parentNode;
//       if (parent && parent.matches && parent.matches('.select2-results__option')) processElement(parent);
//     }
//   });
// });

// function tryAttachSelect2Observer() {
//   if (select2ObserverAttached) return;
//   const container = document.querySelector('.select2-results') || document.querySelector('ul.select2-results__options');
//   if (container) {
//     select2Observer.observe(container, { childList: true, subtree: true, characterData: true });
//     select2ObserverAttached = true;
//     console.log("🔎 select2Observer attaché à :", container);
//     // traiter les options déjà présentes
//     container.querySelectorAll('.select2-results__option').forEach(processElement);
//   }
// }

// // ---------------- observer global (ajouts généraux) ----------------
// const globalObserver = new MutationObserver(mutations => {
//   let processed = 0;
//   for (const m of mutations) {
//     if (m.type === 'childList') {
//       m.addedNodes.forEach(node => {
//         if (node.nodeType !== 1) return;

//         // si le node lui-même correspond
//         if (node.matches && (node.matches('.elementor-repeater-row-item-title') || node.matches('.select2-results__option'))) {
//           processElement(node);
//           processed++;
//         }

//         // rechercher descendants correspondants (très important)
//         node.querySelectorAll && node.querySelectorAll('.elementor-repeater-row-item-title, .select2-results__option').forEach(n => {
//           processElement(n);
//           processed++;
//         });

//         // si on voit l'apparition du container select2 on attache l'observer dédié
//         if (!select2ObserverAttached && (node.matches && node.matches('.select2-results') || node.querySelector && node.querySelector('.select2-results__option'))) {
//           tryAttachSelect2Observer();
//         }
//       });
//     }
//   }
//   if (processed) console.log(`globalObserver: traité ${processed} nouvel(le)(s) élément(s)`);
// });

// globalObserver.observe(document.body, { childList: true, subtree: true });

// // ---------------- traiter les éléments déjà présents au moment du chargement ----------------
// const initial = document.querySelectorAll('.elementor-repeater-row-item-title, .select2-results__option');
// console.log("Éléments initiaux trouvés:", initial.length);
// initial.forEach(processElement);

// // tenter d'attacher le select2Observer maintenant s'il existe
// tryAttachSelect2Observer();

// console.log("👀 Observers activés (global + select2 si détecté)");
