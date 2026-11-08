# Toma las capturas reales que usan las láminas (UI y Swagger) con Edge o
# Chrome sin ventana. Requiere el sistema arriba: docker compose up --build -d
#   powershell -File docs/presentation-data/capturas/capturar.ps1
# Después: npm run todo (desde docs/presentation-data) para regenerar.
param([string]$Ui = "http://localhost:8088", [string]$Solicitudes = "http://localhost:8080")

$navegador = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $navegador) { throw "No se encontró Edge ni Chrome." }

$capturas = [ordered]@{
  "ui-solicitudes.png"        = "$Ui/#/solicitudes"
  "ui-enviadas.png"           = "$Ui/#/enviadas"
  "ui-salud.png"              = "$Ui/#/salud"
  "ui-ayuda.png"              = "$Ui/#/ayuda"
  "swagger-solicitudes.png"   = "$Solicitudes/swagger-ui/index.html"
}

# Perfil temporal: no toca el navegador de quien ejecuta el script.
$perfil = Join-Path ([IO.Path]::GetTempPath()) "arka-capturas-$PID"
foreach ($archivo in $capturas.Keys) {
  $salida = Join-Path $PSScriptRoot $archivo
  Remove-Item $salida -ErrorAction SilentlyContinue
  # Start-Process -Wait espera a que el navegador termine de escribir el PNG.
  $argumentos = @("--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--user-data-dir=$perfil",
    "--window-size=1440,900", "--force-device-scale-factor=1.5", "--virtual-time-budget=10000",
    "--screenshot=$salida", $capturas[$archivo])
  Start-Process -FilePath $navegador -ArgumentList $argumentos -Wait -WindowStyle Hidden
  if (Test-Path $salida) { "OK  $archivo" } else { "XX  $archivo" }
}
Remove-Item -Recurse -Force $perfil -ErrorAction SilentlyContinue
