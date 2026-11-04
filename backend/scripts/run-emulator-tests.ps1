$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$firebaseCli = (Get-Command firebase.cmd -ErrorAction Stop).Source
$previousLocation = Get-Location
$env:BACKEND_EMULATOR_MODE = "1"
$env:FIREBASE_PROJECT_ID = "demo-sa3erli-sprint05"
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"
$env:CORS_ALLOWLIST = "http://localhost:4000"
$env:NODE_ENV = "test"

try {
  Set-Location -LiteralPath $projectRoot
  & $firebaseCli emulators:exec --only auth --project demo-sa3erli-sprint05 "npm --prefix backend run test:e2e:emulator"
  exit $LASTEXITCODE
} finally {
  Set-Location -LiteralPath $previousLocation
}
