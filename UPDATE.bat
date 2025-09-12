@echo off
setlocal

:: Verifier si on est dans le dossier de dev
set "DEV_DIR=C:\Users\PC-Montage\Videos\PARTAGE Montage Quentin\chrome-extensions-CSP-tools"
if /I "%~dp0"=="%DEV_DIR%\" (
    echo Dossier de dev, mise a jour interdite
    pause
    exit /b
)

:: Se placer dans le dossier du script
cd /d "%~dp0"

:: Lien vers le ZIP du repo GitHub (branche main)
set "ZIP_URL=https://github.com/ConceptStorePhoto/chrome-extensions-CSP-tools/archive/refs/heads/main.zip"
set "ZIP_FILE=%TEMP%\extension.zip"

echo Telechargement de la derniere version...
curl -L "%ZIP_URL%" -o "%ZIP_FILE%"

echo Extraction...
powershell -Command "Expand-Archive -Force '%ZIP_FILE%' '%~dp0tmp'"

echo Mise a jour des fichiers...
xcopy "%~dp0tmp\chrome-extensions-CSP-tools-main\*" "%~dp0" /E /H /C /I /Y

echo Nettoyage...
rd /s /q "%~dp0tmp"
del "%ZIP_FILE%"

echo Mise a jour terminee !
echo Pour appliquer les changements :
echo    - Ouvrez chrome://extensions
echo    - Cliquez sur Recharger pour cette extension
echo ou
echo    - Redemarrez Chrome
pause
