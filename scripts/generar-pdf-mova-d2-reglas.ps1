# PDF idéntico al PPT D2 — PowerPoint o LibreOffice (Windows)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Pptx = Join-Path $Root "index\clientes\mkof\MOVA-D2-Reglas-mova_auth.pptx"
$Pdf  = Join-Path $Root "index\clientes\mkof\MOVA-D2-Reglas-mova_auth.pdf"

if (-not (Test-Path $Pptx)) {
    Write-Host "Genera el PPT primero: python scripts\generar-ppt-mova-d2-reglas.py" -ForegroundColor Yellow
    exit 1
}

$soffice = @(
    "C:\Program Files\LibreOffice\program\soffice.exe",
    "C:\Program Files (x86)\LibreOffice\program\soffice.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($soffice) {
    $outDir = Split-Path $Pdf -Parent
    & $soffice --headless --convert-to pdf --outdir $outDir $Pptx
    Write-Host "PDF generado: $Pdf"
    exit 0
}

$pp = $null; $pres = $null
try {
    $pp = New-Object -ComObject PowerPoint.Application
    try { $pp.Visible = $true } catch { }
    $pres = $pp.Presentations.Open((Resolve-Path $Pptx).Path, $true, $false, $true)
    if (Test-Path $Pdf) { Remove-Item $Pdf -Force }
    $pres.ExportAsFixedFormat($Pdf, 2)
    Write-Host "PDF generado: $Pdf"
} finally {
    if ($pres) { try { $pres.Close() } catch {} }
    if ($pp)   { try { $pp.Quit() } catch {} }
}
