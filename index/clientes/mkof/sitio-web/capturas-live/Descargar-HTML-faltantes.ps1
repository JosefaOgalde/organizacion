# Descarga en Windows las capturas HTML de MKOF que Cloudflare bloqueó en Cloud Agent.
# Uso (PowerShell):
#   cd C:\Users\josef\organizacion\index\clientes\mkof\sitio-web\capturas-live
#   powershell -ExecutionPolicy Bypass -File .\Descargar-HTML-faltantes.ps1
#
# Solo reescribe archivos ausentes o con challenge CF (~27 KB / título "Un momento").

$ErrorActionPreference = "Stop"
$OutDir = $PSScriptRoot
$MinOkBytes = 80000

$Pages = @(
    @{ File = "seo--estrategia-seo-360.html"; Url = "https://grupomakingof.com/seo/estrategia-seo-360/" },
    @{ File = "seo--geo-visibilidad-ia.html"; Url = "https://grupomakingof.com/seo/geo-visibilidad-ia/" },
    @{ File = "seo--linkbuilding.html"; Url = "https://grupomakingof.com/seo/linkbuilding/" },
    @{ File = "seo--contenido-seo.html"; Url = "https://grupomakingof.com/seo/contenido-seo/" }
)

function Test-IsCloudflareChallenge {
    param([string]$Html, [string]$Path)
    if (-not (Test-Path $Path)) { return $true }
    $len = (Get-Item $Path).Length
    if ($len -lt $MinOkBytes) { return $true }
    $sample = Get-Content -Path $Path -Raw -Encoding UTF8
    if ($sample -match '(?i)un momento|just a moment|challenges\.cloudflare|cf-browser-verification') {
        return $true
    }
    return $false
}

Write-Host "Carpeta: $OutDir"
$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

foreach ($p in $Pages) {
    $dest = Join-Path $OutDir $p.File
    if (-not (Test-IsCloudflareChallenge -Html "" -Path $dest)) {
        Write-Host "OK ya existe (skip): $($p.File) ($((Get-Item $dest).Length) bytes)"
        continue
    }
    Write-Host "Descargando $($p.Url) -> $($p.File) ..."
    try {
        $resp = Invoke-WebRequest -Uri $p.Url -WebSession $session -UserAgent $ua -UseBasicParsing -TimeoutSec 90
        $html = $resp.Content
        $bytes = [System.Text.Encoding]::UTF8.GetByteCount($html)
        if ($html -match '(?i)un momento|just a moment|challenges\.cloudflare' -or $bytes -lt $MinOkBytes) {
            Write-Host "  AVISO: parece challenge CF ($bytes bytes). Abre la URL en Chrome, pasa el challenge y vuelve a ejecutar."
            # Igual guarda para inspección
            [System.IO.File]::WriteAllText($dest, $html, [System.Text.UTF8Encoding]::new($false))
            continue
        }
        [System.IO.File]::WriteAllText($dest, $html, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  OK $($p.File) ($bytes bytes)"
    }
    catch {
        Write-Host "  ERROR: $_"
    }
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Resumen:"
Get-ChildItem -Path $OutDir -Filter "*.html" | Sort-Object Name | ForEach-Object {
    $flag = if ($_.Length -ge $MinOkBytes) { "OK" } else { "BAD" }
    "{0,4} {1,8} {2}" -f $flag, $_.Length, $_.Name
}

Write-Host ""
Write-Host "Si alguna queda BAD: abre la URL en el navegador (pasa Cloudflare) y vuelve a correr este script."
