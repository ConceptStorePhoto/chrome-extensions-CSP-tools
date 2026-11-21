# Inscrit (ou met a jour) la tache planifiee Windows qui lance UPDATE.bat --auto :
# chaque jour a 8h, ou des que possible si le poste etait eteint a cette heure.
# Appele par UPDATE.bat. La tache tourne sous le compte de l'utilisateur, sans droits administrateur.
param(
    [Parameter(Mandatory = $true)][string]$ExtDir,
    [string]$TaskName = 'CSP tools - Mise a jour'
)
$ErrorActionPreference = 'Stop'

$ExtDir = [System.IO.Path]::GetFullPath($ExtDir)
$bat = Join-Path $ExtDir 'UPDATE.bat'
$log = Join-Path $ExtDir 'update.log'
if (-not (Test-Path -LiteralPath $bat)) { throw "UPDATE.bat introuvable dans $ExtDir" }

# conhost --headless : aucune fenetre ; la sortie du script est ecrite dans update.log
$conhost = Join-Path $env:SystemRoot 'System32\conhost.exe'
$action = New-ScheduledTaskAction -Execute $conhost -WorkingDirectory $ExtDir `
    -Argument ('--headless cmd.exe /c ""{0}" --auto > "{1}" 2>&1"' -f $bat, $log)
$trigger = New-ScheduledTaskTrigger -Daily -At '08:00'
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
$principal = New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) `
    -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
