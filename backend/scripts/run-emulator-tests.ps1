$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("sa3erli-backend-emulator-" + [guid]::NewGuid().ToString("N"))
$asciiProject = Join-Path $temporaryRoot "project"
$firebaseCli = (Get-Command firebase.cmd -ErrorAction Stop).Source
$previousLocation = Get-Location
$env:BACKEND_EMULATOR_MODE = "1"
$env:FIREBASE_PROJECT_ID = "demo-sa3erli-sprint05"
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"
$env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
$env:CORS_ALLOWLIST = "http://localhost:4000"
$env:NODE_ENV = "test"
$env:FIREBASE_CLI_DISABLE_UPDATE_CHECK = "true"
$env:CI = "1"

try {
  New-Item -ItemType Directory -Path $temporaryRoot | Out-Null
  New-Item -ItemType Junction -Path $asciiProject -Target $projectRoot | Out-Null
  Set-Location -LiteralPath $asciiProject
  & $firebaseCli emulators:exec --only auth,firestore --project demo-sa3erli-sprint05 "npm --prefix backend run test:e2e:emulator"
  exit $LASTEXITCODE
} finally {
  Set-Location -LiteralPath $previousLocation
  if (Test-Path -LiteralPath $asciiProject) { [System.IO.Directory]::Delete($asciiProject) }
  if (Test-Path -LiteralPath $temporaryRoot) { Remove-Item -LiteralPath $temporaryRoot }
}
