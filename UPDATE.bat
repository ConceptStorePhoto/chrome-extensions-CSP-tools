@echo off
setlocal

chcp 65001 >nul

:: Vérifier si on est dans le dossier de dev
set DEV_DIR=C:\Users\PC-Montage\Videos\PARTAGE Montage Quentin\chrome-extensions-CSP-tools
if /I "%~dp0"=="%DEV_DIR%\" (
    echo [ATTENTION] Dossier de dev, mise a jour interdite
    pause
    exit /b
)

:: Se placer dans le dossier du script (qui est aussi celui de l'extension)
cd /d %~dp0

:: Lien vers le ZIP du repo GitHub (branche main)
set ZIP_URL=https://github.com/ConceptStorePhoto/chrome-extensions-CSP-tools/archive/refs/heads/main.zip
set ZIP_FILE=%TEMP%\extension.zip

echo [INFO] Telechargement de la derniere version...
curl -L %ZIP_URL% -o %ZIP_FILE%

echo [INFO] Nettoyage du dossier tmp avant extraction...
if exist "%~dp0tmp" rd /s /q "%~dp0tmp"

echo [INFO] Extraction...
powershell -Command "Expand-Archive -Force '%ZIP_FILE%' '%~dp0tmp'"

echo [INFO] Mise a jour des fichiers...
xcopy "%~dp0tmp\chrome-extensions-CSP-tools-main\*" "%~dp0" /E /H /C /I /Y

echo [INFO] Nettoyage...
rd /s /q "%~dp0tmp"
del %ZIP_FILE%

echo.
echo [OK] Mise a jour terminee !
echo.
echo [INFO] Pour appliquer les changements immediatement :
echo       - Ouvrez chrome://extensions
echo       - Cliquez sur "Recharger" pour cette extension
echo   ou
echo       - Redemarrez Chrome pour que la mise a jour soit active automatiquement
echo.
echo En cas d'erreur, relancer le fichier UPDATE.bat
pause
