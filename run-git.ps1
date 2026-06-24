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
    Log-Output "Git repo OK"
}

$origin = git remote get-url origin 2>$null
if (-not $origin) {
    Log-Output (git remote add origin https://github.com/JosefaOgalde/organizacion.git 2>&1 | Out-String)
} else {
    Log-Output "Remote: $origin"
}

if (-not (git config --local user.name 2>$null)) {
    git config --local user.name "JosefaOgalde"
}
if (-not (git config --local user.email 2>$null)) {
    git config --local user.email "105354294+JosefaOgalde@users.noreply.github.com"
}

Log-Output "--- git status ---"
Log-Output (git status 2>&1 | Out-String)

git add app.js index.html styles.css README.md data .gitignore SUBIR.bat run-git.ps1 do-commit.ps1 .vscode .cursor 2>&1 | Out-Null
git add -A 2>&1 | Out-Null
if (Test-Path GIT_RESULT.txt) { git reset HEAD GIT_RESULT.txt 2>&1 | Out-Null }
if (Test-Path git-log.txt) { git reset HEAD git-log.txt 2>&1 | Out-Null }

$msg = @"
Perfil de clientes: tarjetas con color, nombres full time y modal de contexto.

Tarjetas con fondo del color del cliente; nombres Talk (full time), SIE como oportunidad y ADL.
Modal al clic con metas, contexto y manual de marca integrados en el prompt para Cursor.
"@

$statusPorcelain = git status --porcelain 2>&1
if ($statusPorcelain) {
    Log-Output "--- commit ---"
    Log-Output (git commit -m $msg 2>&1 | Out-String)
    Log-Output "HASH: $(git rev-parse HEAD 2>&1)"
    Log-Output "--- archivos en commit ---"
    Log-Output (git show --name-only --pretty=format: HEAD 2>&1 | Out-String)
} else {
    Log-Output "Sin cambios nuevos para commitear (working tree limpio o ya guardado)."
    Log-Output "HASH actual: $(git rev-parse HEAD 2>&1)"
}

git branch -M main 2>&1 | Out-Null
Log-Output "--- push ---"
Log-Output (git push -u origin main 2>&1 | Out-String)

Log-Output "--- git status final ---"
Log-Output (git status 2>&1 | Out-String)
Log-Output "=== GIT WORKFLOW END $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="
