param(
    [string]$RuntimeRoot = "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies",
    [string]$SkillRoot = "$env:USERPROFILE\.codex\plugins\cache\openai-primary-runtime\presentations\26.1015.12040\skills\presentations"
)
$ErrorActionPreference = 'Stop'
$node = Join-Path $RuntimeRoot 'node\bin\node.exe'
$env:ARKA_NODE_MODULES = Join-Path $RuntimeRoot 'node\node_modules'
$env:RUNTIME_NODE_MODULES = $env:ARKA_NODE_MODULES
$env:ARKA_PYTHON = Join-Path $RuntimeRoot 'python\python.exe'
$env:ARKA_PRESENTATIONS_SKILL = $SkillRoot
foreach ($required in @($node, $env:ARKA_NODE_MODULES, $env:ARKA_PYTHON, $SkillRoot)) {
    if (-not (Test-Path -LiteralPath $required)) { throw "No existe la dependencia: $required. Ajusta RuntimeRoot o SkillRoot." }
}
& $node (Join-Path $PSScriptRoot 'generar-ppt.mjs')
if ($LASTEXITCODE -ne 0) { throw "La generación terminó con código $LASTEXITCODE" }
