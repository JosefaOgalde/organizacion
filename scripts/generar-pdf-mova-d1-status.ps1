# Genera PDF idéntico al PPT usando Microsoft PowerPoint (Windows).
# Uso:
#   copy C:\Users\josef\Downloads\MOVA-D1-Inventario-Status.pptx index\clientes\mkof\
#   powershell -ExecutionPolicy Bypass -File scripts\generar-pdf-mova-d1-status.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Pptx = Join-Path $Root "index\clientes\mkof\MOVA-D1-Inventario-Status.pptx"
$Pdf  = Join-Path $Root "index\clientes\mkof\MOVA-D1-Inventario-Status.pdf"

if (-not (Test-Path $Pptx)) {
    Write-Host "No existe el PPT: $Pptx" -ForegroundColor Red
    Write-Host "Copia primero:"
    Write-Host "  copy C:\Users\josef\Downloads\MOVA-D1-Inventario-Status.pptx index\clientes\mkof\"
    exit 1
}

# Intentar LibreOffice si está instalado
$soffice = @(
    "C:\Program Files\LibreOffice\program\soffice.exe",
    "C:\Program Files (x86)\LibreOffice\program\soffice.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($soffice) {
    Write-Host "Convirtiendo con LibreOffice…"
    $outDir = Split-Path $Pdf -Parent
    & $soffice --headless --convert-to pdf --outdir $outDir $Pptx
    $generated = Join-Path $outDir "MOVA-D1-Inventario-Status.pdf"
    if (Test-Path $generated) {
        Write-Host "PDF generado: $generated"
        Write-Host "Método: LibreOffice (idéntico al PPT)"
        exit 0
    }
}

# PowerPoint COM
Write-Host "Convirtiendo con Microsoft PowerPoint…"
$pp = $null
$pres = $null
try {
    $pp = New-Object -ComObject PowerPoint.Application
    $pp.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse
    $pres = $pp.Presentations.Open($Pptx, $true, $true, $false)
    # ppSaveAsPDF = 32
    $pres.SaveAs($Pdf, 32)
    Write-Host "PDF generado: $Pdf"
    Write-Host "Método: PowerPoint (idéntico al PPT)"
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternativas:"
    Write-Host "  1. Abre el PPT → Archivo → Exportar → Crear PDF"
    Write-Host "  2. Instala LibreOffice: https://www.libreoffice.org/download/"
    exit 2
}
finally {
    if ($pres) { $pres.Close() }
    if ($pp)   { $pp.Quit() }
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
