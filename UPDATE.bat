@echo off
setlocal

chcp 65001 >nul

:: Vérifier si on est dans le dossier de dev
set DEV_DIR=C:\Users\PC-Montage\Videos\PARTAGE Montage Quentin\chrome-extensions-CSP-tools
if /I "%~dp0"=="%DEV_DIR%\" (
    echo ⚠️ Dossier de dev, mise à jour interdite
    pause
    exit /b
)

:: Se placer dans le dossier du script (qui est aussi celui de l’extension)
cd /d %~dp0

:: Lien vers le ZIP du repo GitHub (branche main)
set ZIP_URL=https://github.com/ConceptStorePhoto/chrome-extensions-CSP-tools/archive/refs/heads/main.zip
set ZIP_FILE=%TEMP%\extension.zip

echo 📥 Téléchargement de la dernière version...
curl -L %ZIP_URL% -o %ZIP_FILE%

echo 📦 Extraction...
powershell -Command "Expand-Archive -Force '%ZIP_FILE%' '%~dp0tmp'"

echo 🔄 Mise à jour des fichiers...
xcopy "%~dp0tmp\chrome-extensions-CSP-tools-main\*" "%~dp0" /E /H /C /I /Y

echo 🧹 Nettoyage...
rd /s /q "%~dp0tmp"
del %ZIP_FILE%

echo.
echo ✅ Mise à jour terminée !
echo.
echo ℹ️ Pour appliquer les changements immédiatement :
echo    - Ouvrez chrome://extensions
echo    - Cliquez sur "Recharger" pour cette extension
echo ou
echo    - Redémarrez Chrome pour que la mise à jour soit active automatiquement
echo.
pause
