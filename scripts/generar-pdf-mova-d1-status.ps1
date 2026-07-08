# Genera PDF idéntico al PPT usando LibreOffice o Microsoft PowerPoint (Windows).
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

$Pptx = (Resolve-Path $Pptx).Path
$Pdf  = [System.IO.Path]::GetFullPath($Pdf)

# 1) LibreOffice (sin abrir ventanas)
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

# 2) PowerPoint COM — ventana visible (algunas instalaciones no permiten ocultarla)
Write-Host "Convirtiendo con Microsoft PowerPoint…"
Write-Host "(Se abrirá PowerPoint unos segundos; no lo cierres hasta que termine.)"

$pp = $null
$pres = $null
try {
    $pp = New-Object -ComObject PowerPoint.Application

    # No usar msoFalse: en Office reciente falla con "Hiding the application window is not allowed"
    try { $pp.Visible = $true } catch { }

    # Open(FileName, ReadOnly, Untitled, WithWindow)
    $pres = $pp.Presentations.Open($Pptx, $true, $false, $true)

    if (Test-Path $Pdf) { Remove-Item $Pdf -Force }

    # ppFixedFormatTypePDF = 2
    $pres.ExportAsFixedFormat($Pdf, 2)

    if (-not (Test-Path $Pdf)) {
        throw "PowerPoint no creó el archivo PDF en: $Pdf"
    }

    Write-Host "PDF generado: $Pdf"
    Write-Host "Método: PowerPoint ExportAsFixedFormat (idéntico al PPT)"
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternativas:"
    Write-Host "  1. Abre el PPT → Archivo → Exportar → Crear PDF/XPS → Guardar como MOVA-D1-Inventario-Status.pdf"
    Write-Host "  2. Instala LibreOffice: https://www.libreoffice.org/download/"
    Write-Host "  3. python scripts\generar-pdf-mova-d1-status.py   (requiere LibreOffice en PATH)"
    exit 2
}
finally {
    if ($pres) {
        try { $pres.Close() } catch { }
    }
    if ($pp) {
        try { $pp.Quit() } catch { }
    }
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
