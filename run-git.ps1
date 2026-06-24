Set-Location $PSScriptRoot
$resultFile = Join-Path $PSScriptRoot 'GIT_RESULT.txt'

function Log-Output {
    param([string]$Text)
    $Text | Tee-Object -FilePath $resultFile -Append
}

if (Test-Path $resultFile) { Remove-Item $resultFile -Force }

Log-Output "=== GIT WORKFLOW START $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="

if (-not (Test-Path .git)) {
    Log-Output (git init 2>&1 | Out-String)
} else {
    Log-Output "Git repo already exists"
}

$origin = git remote get-url origin 2>$null
if ($origin) {
    Log-Output (git remote set-url origin https://github.com/JosefaOgalde/organizacion.git 2>&1 | Out-String)
    Log-Output "Remote origin set-url (was: $origin)"
} else {
    Log-Output (git remote add origin https://github.com/JosefaOgalde/organizacion.git 2>&1 | Out-String)
    Log-Output "Remote origin added"
}

# Identidad local solo para este repo (no modifica config global)
$userName = git config --local user.name 2>$null
$userEmail = git config --local user.email 2>$null
if (-not $userName) {
    git config --local user.name "JosefaOgalde"
    Log-Output "user.name configurado localmente: JosefaOgalde"
}
if (-not $userEmail) {
    git config --local user.email "105354294+JosefaOgalde@users.noreply.github.com"
    Log-Output "user.email configurado localmente (GitHub noreply)"
}

Log-Output (git add -A 2>&1 | Out-String)
Log-Output (git commit -m "Initial commit: organizador diario HTML app" 2>&1 | Out-String)
Log-Output (git branch -M main 2>&1 | Out-String)
Log-Output (git push -u origin main 2>&1 | Out-String)

Log-Output "=== GIT WORKFLOW END $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="
