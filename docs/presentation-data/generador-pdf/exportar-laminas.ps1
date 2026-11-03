# Exporta las láminas de cada versión a PDF con PowerPoint (Windows):
#   pdf/ARKA-Lite-<variante>-laminas.pdf, una por cada PPTX de pptx/
#   pdf/ARKA-Lite-<variante>-laminas-y-guion.pdf, cada lámina con su guion debajo
# No es parte de npm run todo porque necesita PowerPoint instalado. Correrlo
# después de npm run pptx:
#   npm run pdf-laminas
# Los videos se ven con su imagen de portada.
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$raiz = Split-Path -Parent $PSScriptRoot
$pptx = Join-Path $raiz "pptx"
$pdf = Join-Path $raiz "pdf"
New-Item -ItemType Directory -Force $pdf | Out-Null
$imagenes = Join-Path ([System.IO.Path]::GetTempPath()) "arka-lite-laminas"
$app = New-Object -ComObject PowerPoint.Application
try {
  foreach ($variante in "ejecutivo-con-videos", "ejecutivo-sin-demo") {
    $origen = Join-Path $pptx "ARKA-Lite-$variante.pptx"
    $destino = Join-Path $pdf "ARKA-Lite-$variante-laminas.pdf"
    $p = $app.Presentations.Open($origen, -1, 0, 0)   # solo lectura, sin ventana
    $p.SaveAs($destino, 32)                           # 32 = ppSaveAsPDF
    # Cada lámina en imagen, para el PDF con el guion debajo.
    $carpeta = Join-Path $imagenes $variante
    if (Test-Path $carpeta) { Remove-Item -Recurse -Force $carpeta }
    New-Item -ItemType Directory -Force $carpeta | Out-Null
    for ($i = 1; $i -le $p.Slides.Count; $i++) { $p.Slides.Item($i).Export((Join-Path $carpeta "$i.png"), "PNG", 1600, 900) }
    $p.Close()
    Write-Output "PDF de láminas: $destino"
  }
} finally {
  $app.Quit()
}
node (Join-Path $PSScriptRoot "laminas-y-guion.ts") $imagenes
if ($LASTEXITCODE -ne 0) { throw "No se pudo generar el PDF de láminas y guion." }
