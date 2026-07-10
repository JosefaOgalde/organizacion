# Genera PDF desde PPT — MOVA GitHub + n8n Checklist (PowerPoint en Windows)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$PptPath = Join-Path $Root "index\clientes\mkof\MOVA-GitHub-N8n-Checklist.pptx"
$PdfPath = Join-Path $Root "index\clientes\mkof\MOVA-GitHub-N8n-Checklist.pdf"

if (-not (Test-Path $PptPath)) {
    python (Join-Path $Root "scripts\generar-ppt-mova-github-n8n-checklist.py")
}

$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = [bool]$true
try {
    $pres = $pp.Presentations.Open($PptPath, $true, $false, $false)
    $pres.ExportAsFixedFormat($PdfPath, 2) # ppSaveAsPDF
    $pres.Close()
} finally {
    $pp.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pp) | Out-Null
}
Write-Host "PDF generado: $PdfPath"
