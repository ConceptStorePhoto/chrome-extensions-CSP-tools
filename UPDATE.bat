@echo off
:: CSP tools - Mise a jour de l'extension
:: Telecharge la derniere version depuis GitHub et remplace les fichiers de ce dossier.
:: Si un fichier update-token.txt est present, le telechargement passe par l'API GitHub
:: avec ce token, ce qui permet la mise a jour depuis un depot prive.
goto :main

:: NE PAS SUPPRIMER la zone de ":" ci-dessous.
:: L'ancienne version d'UPDATE.bat s'ecrase elle-meme pendant sa copie, puis cmd reprend
:: la lecture de ce nouveau fichier a l'octet ou il s'etait arrete : 961 (fins de ligne LF)
:: ou 992 (CRLF). Cette reprise doit tomber dans la zone, puis aboutir au bloc qui suit.
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Fin de la transition depuis l'ancienne version : nettoyage de ses fichiers temporaires.
if exist "%~dp0tmp" rd /s /q "%~dp0tmp"
if exist "%TEMP%\extension.zip" del "%TEMP%\extension.zip"
echo.
echo [OK] Mise a jour terminee, nouvelle methode de mise a jour installee.
echo.
echo [INFO] Pour appliquer les changements immediatement :
echo       - Ouvrez chrome://extensions
echo       - Cliquez sur "Recharger" pour cette extension
echo   ou
echo       - Redemarrez Chrome
echo.
pause
exit /b


:main
:: Le script se relance depuis une copie dans %TEMP% : la copie des nouveaux fichiers
:: peut ainsi remplacer UPDATE.bat sans perturber le script en cours d'execution.
:: UPDATE.bat --auto : mode silencieux utilise par la tache planifiee, sans pause.
if /i "%~1"=="--depuis-temp" goto :maj
copy /y "%~f0" "%TEMP%\csp-tools-update.bat" >nul || (
    echo [ERREUR] Impossible de preparer la mise a jour dans le dossier temporaire.
    if /i not "%~1"=="--auto" pause
    exit /b 1
)
"%TEMP%\csp-tools-update.bat" --depuis-temp "%~dp0" %1

:maj
setlocal
chcp 65001 >nul

set "EXT_DIR=%~2"
set "REPO=ConceptStorePhoto/chrome-extensions-CSP-tools"
set "ZIP_FILE=%TEMP%\csp-tools-update.zip"
set "WORK_DIR=%TEMP%\csp-tools-update"
set "AUTO="
if /i "%~3"=="--auto" set "AUTO=1"
if defined AUTO echo [INFO] Mise a jour automatique du %date% a %time%

if not exist "%EXT_DIR%manifest.json" (
    echo [ERREUR] Dossier de l'extension introuvable : %EXT_DIR%
    if not defined AUTO pause
    exit /b 1
)

:: Garde-fou : un dossier contenant .git est un depot de developpement, jamais un poste
if exist "%EXT_DIR%.git" (
    echo [ATTENTION] Dossier de developpement detecte, presence de .git : mise a jour interdite.
    if not defined AUTO pause
    exit /b 1
)

cd /d "%EXT_DIR%"
if exist "%EXT_DIR%tmp" rd /s /q "%EXT_DIR%tmp"

:: Inscrit la tache planifiee qui relance ce script chaque jour en mode silencieux.
:: Refait a chaque lancement manuel : la tache suit le dossier s'il a ete deplace.
if not defined AUTO (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%EXT_DIR%maj-auto.ps1" -ExtDir "%EXT_DIR%." >nul 2>&1
    if errorlevel 1 (
        echo [ATTENTION] Mise a jour automatique non activee : il faudra lancer UPDATE.bat a la main.
    ) else (
        echo [OK] Mise a jour automatique activee : chaque jour a 8h, ou des l'ouverture de session si le poste etait eteint.
    )
)

set "GH_TOKEN="
if exist "%EXT_DIR%update-token.txt" set /p GH_TOKEN=<"%EXT_DIR%update-token.txt"

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

:: Le ZIP contient un seul dossier racine, dont le nom change selon la source
set "SRC_DIR="
for /d %%D in ("%WORK_DIR%\*") do set "SRC_DIR=%%D"
if not defined SRC_DIR goto :erreur_extraction
if not exist "%SRC_DIR%\manifest.json" goto :erreur_extraction

echo [INFO] Mise a jour des fichiers...
xcopy "%SRC_DIR%\*" "%EXT_DIR%." /E /H /C /I /Y
if errorlevel 1 goto :erreur_copie

:: xcopy ne supprime rien : retire les anciennes copies a la racine des fichiers
:: deplaces dans content-script\, uniquement si la nouvelle copie existe.
for %%F in ("%EXT_DIR%content-*.js") do if exist "%EXT_DIR%content-script\%%~nxF" del /q "%%~fF"

set "NEW_VERSION="
for /f "usebackq delims=" %%V in (`powershell -NoProfile -Command "(ConvertFrom-Json (Get-Content -Raw -Encoding UTF8 -LiteralPath '%EXT_DIR%manifest.json')).version"`) do set "NEW_VERSION=%%V"

echo [INFO] Nettoyage...
rd /s /q "%WORK_DIR%"
del "%ZIP_FILE%"

echo.
echo [OK] Mise a jour terminee : version %NEW_VERSION%
echo.
echo [INFO] Pour appliquer les changements immediatement :
echo       - Ouvrez chrome://extensions
echo       - Cliquez sur "Recharger" pour cette extension
echo   ou
echo       - Redemarrez Chrome
echo.
echo En cas d'erreur, relancer le fichier UPDATE.bat
echo.
if not defined AUTO pause
exit /b 0


:erreur_telechargement
echo.
echo [ERREUR] Le telechargement a echoue. Aucun fichier de l'extension n'a ete modifie.
if defined GH_TOKEN echo          Verifiez la connexion internet. Si le probleme persiste, le fichier update-token.txt n'est plus valide.
if not defined GH_TOKEN echo          Verifiez la connexion internet. Si le depot GitHub est devenu prive, il manque le fichier update-token.txt dans ce dossier.
goto :fin_erreur

:erreur_extraction
echo.
echo [ERREUR] Le fichier telecharge est invalide. Aucun fichier de l'extension n'a ete modifie.
goto :fin_erreur

:erreur_copie
echo.
echo [ERREUR] La copie des fichiers a echoue, la mise a jour est peut-etre incomplete.
echo          Relancez UPDATE.bat.
goto :fin_erreur

:fin_erreur
if exist "%WORK_DIR%" rd /s /q "%WORK_DIR%"
if exist "%ZIP_FILE%" del "%ZIP_FILE%"
echo.
if not defined AUTO pause
exit /b 1
