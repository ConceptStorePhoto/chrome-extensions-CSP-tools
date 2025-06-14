import { checkForUpdate } from './update-check.js';
// Vérification des mises à jour à l'initialisation de l'extension
console.log("🔄 Vérification des mises à jour au démarrage de l'extension...");
checkForUpdate().then(result => {
    if (result.updateAvailable) {
        console.log("🔔 Mise à jour détectée :", result.remoteVersion);
        showUpdateNotification(result.remoteVersion, result.repoURL);
    }
});

// Affiche une notification native Chrome
function showUpdateNotification(version, url) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "logo.png", 
        title: "CSP tools - Nouvelle version disponible",
        message: `Version ${version} disponible. Cliquez pour voir.`,
        priority: 2
    }, (notificationId) => {
        chrome.notifications.onClicked.addListener((notifId) => {
            if (notifId === notificationId) {
                chrome.tabs.create({ url });
            }
        });
    });
}