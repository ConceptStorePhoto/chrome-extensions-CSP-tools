# CSP tools

Extension Chrome qui permet de corriger certains problèmes d'interface sur le site web.

## Fonctionnalités
- **Notifications** : Affiche des notifications pour informer l'utilisateur des mises à jour de l'extension.
- **Commandes personnalisées** : La popup de l'extention permet de personnaliser les fonctions pour les adapter à vos besoins.
- **Menu contextuel** : Fonctionnalités de l'extension dans le menu contextuel du navigateur. (clique droit)
- **Site web du magasin** PrestaShop 8.2.0 :
    - **Correction d'interface** : Permet de corriger des problèmes d'interface sur le site web.
    - **Amélioration de l'expérience utilisateur** : Ajout de fonctionnalités pour améliorer l'expérience utilisateur ADMIN sur le site web.
    - **Noms des onglets** : Permet de renommer les onglets du site web pour une meilleure compréhension.
    - **Raccourcis clavier** : Permet d'utiliser des raccourcis clavier pour accéder rapidement aux fonctionnalités de l'extension.
        - Alt+Shift+Q : Retour au catalogue depuis modification de produit
- **LeBonCoin** : 
    - **Création d'annonce** : Complétion automatique de la description pour simplifier la création des annonces
    - **Preset d'adresse** : Ajout de raccourcis pour changer l'adresse du produit
- **Colissimo** : 
    - **Collecte** : Ajout d'une confirmation avant l'annulation de la collecte 

Voir le Wiki pour plus de détails : [Wiki CSP tools](https://github.com/ConceptStorePhoto/chrome-extensions-CSP-tools/wiki)

## Installation

- Télécharger le github au format ZIP 
    - [Télécharger le ZIP](https://github.com/ConceptStorePhoto/chrome-extensions-CSP-tools/archive/refs/heads/main.zip)
- Décompresser le fichier ZIP dans un dossier définitif, par exemple `C:\CSP-tools` : pas dans Téléchargements, sur le Bureau ou dans un dossier synchronisé OneDrive
    - ⚠️ Ne plus déplacer ce dossier ensuite : Chrome ne retrouverait plus l'extension, et la recharger depuis un autre dossier efface tous ses réglages
- Ouvrir Google Chrome
- Accéder à la page des extensions de Chrome : [chrome://extensions/](chrome://extensions/)
- Activer le mode développeur en haut à droite
- Cliquer sur "Charger l'extension non empaquetée"
- Sélectionner le dossier décompressé précédemment
- L'extension devrait apparaître dans la liste des extensions installées
- Lancer une fois `UPDATE.bat` (dans le dossier de l'extension) : il active la mise à jour automatique
    - Si le dépôt est privé, déposer d'abord dans le dossier le fichier `update-token.txt` fourni
- Vous pouvez maintenant utiliser l'extension
- Penser à l'épingler à la barre d'outils, pour un accès rapide  


## Mise à jour
**Automatique** : après un premier lancement de `UPDATE.bat`, une tâche planifiée Windows (« CSP tools - Mise a jour ») met l'extension à jour chaque jour à 8 h, ou dès l'ouverture de session si le poste était éteint à cette heure. Une notification « Mise à jour installée » propose ensuite d'activer la nouvelle version. Le résultat de la dernière mise à jour automatique est écrit dans `update.log`, dans le dossier de l'extension.

**Manuelle** : lancer `UPDATE.bat` dans le dossier de l'extension, puis cliquer sur « Recharger » dans [chrome://extensions/](chrome://extensions/) ou redémarrer Google Chrome.


<br>
<br>


## Basé sur la documentation de Google Chrome

Getting Started With Google Chrome Extensions (Hello World)  
This example demonstrates how to create a simple "Hello World" Chrome Extension.
For more details, visit the [official tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world).

<br> 

----
<br>

Dev par [QuentinPerou](https://github.com/quentinperou)  

Réalisé avec l'assistance de ChatGPT, GitHub Copilot et Claude Code ^^
