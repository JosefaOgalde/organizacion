Set-Location $PSScriptRoot
$out = Join-Path $PSScriptRoot 'GIT_RESULT.txt'
$sb = New-Object System.Text.StringBuilder

function Log($s) {
    [void]$sb.AppendLine($s)
    Write-Output $s
}

Log "=== COMMIT $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="
Log (git status 2>&1 | Out-String)
Log "--- DIFF STAT ---"
Log (git diff --stat 2>&1 | Out-String)
Log (git diff --cached --stat 2>&1 | Out-String)
Log "--- LOG ---"
Log (git log -3 --oneline 2>&1 | Out-String)

git add app.js index.html styles.css README.md data .gitignore SUBIR.bat run-git.ps1 .vscode .cursor 2>&1 | Out-Null
git add -A 2>&1 | Out-Null
if (Test-Path GIT_RESULT.txt) { git reset HEAD GIT_RESULT.txt 2>&1 | Out-Null }

$msg = @"
Perfil de clientes: tarjetas con color, nombres full time y modal de contexto.

Tarjetas con fondo del color del cliente; nombres Talk (full time), SIE como oportunidad y ADL.
Modal al clic con metas, contexto y manual de marca integrados en el prompt para Cursor.
"@

$commitOut = git commit -m $msg 2>&1 | Out-String
Log "--- COMMIT ---"
Log $commitOut
Log "--- STATUS POST ---"
Log (git status 2>&1 | Out-String)
Log "COMMIT_HASH=$(git rev-parse HEAD 2>&1)"
Log "--- FILES ---"
Log (git show --name-only --pretty=format: HEAD 2>&1 | Out-String)

$pushOut = git push -u origin main 2>&1 | Out-String
Log "--- PUSH ---"
Log $pushOut
if ($LASTEXITCODE -eq 0) { Log "PUSH_SUCCEEDED=yes" } else { Log "PUSH_SUCCEEDED=no" }

$sb.ToString() | Set-Content -Path $out -Encoding UTF8
