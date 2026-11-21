@echo off
setlocal
chcp 65001 >nul
:: CSP tools - Installation de l'extension sur un NOUVEAU poste.
:: Installe la derniere version dans C:\CSP-tools, ou dans le dossier passe en parametre,
:: active la mise a jour automatique, puis guide le chargement dans Chrome.
:: La copie a envoyer, avec le token integre, est creee par creer-installeur.ps1.

:: Token de mise a jour : integre par creer-installeur.ps1 dans la copie a envoyer, jamais dans le depot
set "GH_TOKEN="

set "INSTALL_DIR=C:\CSP-tools"
if not "%~1"=="" set "INSTALL_DIR=%~f1"
set "REPO=ConceptStorePhoto/chrome-extensions-CSP-tools"
set "ZIP_FILE=%TEMP%\csp-tools-install.zip"
set "WORK_DIR=%TEMP%\csp-tools-install"

:: Garde-fou : ce modele est aussi present dans chaque extension installee, dossier installeur.
:: Lance depuis la, il installerait une seconde copie et detournerait la mise a jour automatique.
if exist "%~dp0..\manifest.json" goto :deja_dans_extension
if exist "%~dp0manifest.json" goto :deja_dans_extension

if not defined GH_TOKEN if exist "%~dp0update-token.txt" set /p GH_TOKEN=<"%~dp0update-token.txt"

echo.
echo   CSP tools - Installation
echo   Dossier : %INSTALL_DIR%
echo.

if exist "%INSTALL_DIR%\manifest.json" (
    echo [INFO] L'extension est deja installee dans ce dossier : rien n'est remplace.
    echo        Pour la mettre a jour, lancez UPDATE.bat dans %INSTALL_DIR%.
    goto :chrome
)

echo [INFO] Telechargement de la derniere version...
if exist "%ZIP_FILE%" del "%ZIP_FILE%"
if defined GH_TOKEN (
    curl -fL -H "Authorization: Bearer %GH_TOKEN%" -o "%ZIP_FILE%" "https://api.github.com/repos/%REPO%/zipball/main"
) else (
    curl -fL -o "%ZIP_FILE%" "https://github.com/%REPO%/archive/refs/heads/main.zip"
)
if errorlevel 1 goto :erreur_telechargement

echo [INFO] Extraction...
if exist "%WORK_DIR%" rd /s /q "%WORK_DIR%"
powershell -NoProfile -Command "$ErrorActionPreference = 'Stop'; Expand-Archive -Force -LiteralPath '%ZIP_FILE%' -DestinationPath '%WORK_DIR%'"
if errorlevel 1 goto :erreur_extraction
set "SRC_DIR="
for /d %%D in ("%WORK_DIR%\*") do set "SRC_DIR=%%D"
if not defined SRC_DIR goto :erreur_extraction
if not exist "%SRC_DIR%\manifest.json" goto :erreur_extraction

echo [INFO] Installation dans %INSTALL_DIR%...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%" 2>nul
if not exist "%INSTALL_DIR%" goto :erreur_dossier
xcopy "%SRC_DIR%\*" "%INSTALL_DIR%" /E /H /C /I /Y >nul
if errorlevel 1 goto :erreur_copie
if defined GH_TOKEN (
    >"%INSTALL_DIR%\update-token.txt" echo %GH_TOKEN%
)
rd /s /q "%WORK_DIR%"
del "%ZIP_FILE%"

powershell -NoProfile -ExecutionPolicy Bypass -File "%INSTALL_DIR%\maj-auto.ps1" -ExtDir "%INSTALL_DIR%" >nul 2>&1
if errorlevel 1 (
    echo [ATTENTION] Mise a jour automatique non activee : lancez UPDATE.bat dans %INSTALL_DIR% pour reessayer.
) else (
    echo [OK] Mise a jour automatique activee : chaque jour a 8h, ou des l'ouverture de session si le poste etait eteint.
)
echo [OK] Extension installee dans %INSTALL_DIR%

:chrome
:: Chrome interdit d'installer une extension non empaquetee par un script : cette etape reste manuelle.
powershell -NoProfile -Command "Set-Clipboard -Value '%INSTALL_DIR%'" >nul 2>&1
set "CHROME_OK="
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" >nul 2>&1 && set "CHROME_OK=1"
reg query "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" >nul 2>&1 && set "CHROME_OK=1"
if defined CHROME_OK start "" chrome "chrome://extensions"

echo.
echo ================================================================
echo   Derniere etape, dans Chrome
echo ================================================================
echo   1. Ouvrez la page chrome://extensions, deja ouverte si Chrome est installe
echo   2. Activez le "Mode developpeur", en haut a droite
echo   3. Cliquez sur "Charger l'extension non empaquetee"
echo   4. Dans la fenetre, collez avec Ctrl+V dans le champ "Dossier", en bas,
echo      puis cliquez sur "Selectionner un dossier".
echo      Le chemin %INSTALL_DIR% est deja copie dans le presse-papiers.
echo   5. Epinglez l'extension : icone en forme de piece de puzzle, puis punaise
echo.
echo   Ne deplacez jamais le dossier %INSTALL_DIR% : Chrome ne retrouverait plus l'extension.
echo.
pause
exit /b 0


:deja_dans_extension
echo [ATTENTION] Ce fichier sert a installer l'extension sur un NOUVEAU poste.
echo             L'extension est deja installee ici : pour la mettre a jour, lancez UPDATE.bat.
pause
exit /b 1

:erreur_telechargement
echo.
echo [ERREUR] Le telechargement a echoue. Rien n'a ete installe.
if defined GH_TOKEN echo          Verifiez la connexion internet. Si le probleme persiste, demandez une nouvelle copie de l'installeur.
if not defined GH_TOKEN echo          Verifiez la connexion internet. Si le depot GitHub est prive, cet installeur ne contient pas le token : demandez la copie a jour.
goto :fin_erreur

:erreur_extraction
echo.
echo [ERREUR] Le fichier telecharge est invalide. Rien n'a ete installe.
goto :fin_erreur

:erreur_dossier
echo.
echo [ERREUR] Impossible de creer le dossier %INSTALL_DIR%.
echo          Contactez la personne qui vous a envoye l'installeur.
goto :fin_erreur

:erreur_copie
echo.
echo [ERREUR] La copie des fichiers a echoue, l'installation est incomplete.
echo          Supprimez le dossier %INSTALL_DIR%, puis relancez l'installeur.
goto :fin_erreur

:fin_erreur
if exist "%WORK_DIR%" rd /s /q "%WORK_DIR%"
if exist "%ZIP_FILE%" del "%ZIP_FILE%"
echo.
pause
exit /b 1
