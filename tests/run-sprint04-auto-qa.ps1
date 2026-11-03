$ErrorActionPreference = "Stop"
$env:SPRINT04_QA_AUTOMATED = "1"
try {
  & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "run-sprint04-qa.ps1")
  exit $LASTEXITCODE
} finally {
  Remove-Item Env:SPRINT04_QA_AUTOMATED -ErrorAction SilentlyContinue
}
