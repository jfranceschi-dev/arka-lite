# Exporta las láminas de cada variante a PDF con PowerPoint (Windows):
#   pdf/ARKA-Lite-resumen-laminas.pdf, -ejecutivo-laminas.pdf, -tecnico-laminas.pdf
# No es parte de npm run todo porque necesita PowerPoint instalado. Correrlo
# después de npm run pptx:
#   npm run pdf-laminas
# Las animaciones por clic no existen en un PDF: cada lámina sale completa.
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$raiz = Split-Path -Parent $PSScriptRoot
$pptx = Join-Path $raiz "pptx"
$pdf = Join-Path $raiz "pdf"
New-Item -ItemType Directory -Force $pdf | Out-Null
$app = New-Object -ComObject PowerPoint.Application
try {
  foreach ($variante in "resumen", "ejecutivo", "tecnico") {
    $origen = Join-Path $pptx "ARKA-Lite-$variante.pptx"
    $destino = Join-Path $pdf "ARKA-Lite-$variante-laminas.pdf"
    $p = $app.Presentations.Open($origen, -1, 0, 0)   # solo lectura, sin ventana
    $p.SaveAs($destino, 32)                           # 32 = ppSaveAsPDF
    $p.Close()
    Write-Output "PDF de láminas: $destino"
  }
} finally {
  $app.Quit()
}
