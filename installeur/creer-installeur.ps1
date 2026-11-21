# Cree la copie de l'installeur a envoyer aux nouveaux postes : INSTALLER.bat avec le token integre.
# La copie est ecrite dans installeur\a-envoyer\, ignore par git : ne jamais la committer.
# Usage, depuis le dossier du projet :
#   powershell -NoProfile -ExecutionPolicy Bypass -File installeur\creer-installeur.ps1
$ErrorActionPreference = 'Stop'

$racine = Split-Path -Parent $PSScriptRoot
$tokenFile = Join-Path $racine 'update-token.txt'
if (-not (Test-Path -LiteralPath $tokenFile)) { throw "update-token.txt introuvable dans $racine" }
$token = (Get-Content -Raw -LiteralPath $tokenFile).Trim()
if ($token -notmatch '^github_pat_\w+$') { throw "Le contenu de update-token.txt ne ressemble pas a un token GitHub" }

$modele = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'INSTALLER.bat')
$ligneVide = 'set "GH_TOKEN="'
if ([regex]::Matches($modele, [regex]::Escape($ligneVide)).Count -ne 1) { throw "La ligne $ligneVide doit apparaitre une seule fois dans INSTALLER.bat" }
$copie = $modele.Replace($ligneVide, ('set "GH_TOKEN={0}"' -f $token))

$sortie = Join-Path $PSScriptRoot 'a-envoyer'
New-Item -ItemType Directory -Force -Path $sortie | Out-Null
$fichier = Join-Path $sortie 'Installateur-CSP-tools-Windows.bat'
[System.IO.File]::WriteAllText($fichier, $copie, [System.Text.Encoding]::ASCII)
Write-Host "Installeur pret a envoyer : $fichier"
