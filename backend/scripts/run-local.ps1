$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$firebaseCli = (Get-Command firebase.cmd -ErrorAction Stop).Source
$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("sa3erli-sprint05-run-" + [guid]::NewGuid().ToString("N"))
$asciiProject = Join-Path $temporaryRoot "project"
$previousLocation = Get-Location
$exitCode = 1

$env:NEXT_PUBLIC_FIREBASE_EMULATOR_MODE = "1"
$env:NEXT_PUBLIC_FIREBASE_API_KEY = "demo-api-key"
$env:NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "demo-sa3erli-sprint05.localhost"
$env:NEXT_PUBLIC_FIREBASE_PROJECT_ID = "demo-sa3erli-sprint05"
$env:NEXT_PUBLIC_FIREBASE_APP_ID = "demo-app-id"
$env:BACKEND_EMULATOR_MODE = "1"
$env:FIREBASE_PROJECT_ID = "demo-sa3erli-sprint05"
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"
$env:CORS_ALLOWLIST = "http://localhost:4000,http://127.0.0.1:4000"
$env:NODE_ENV = "production"
$env:PORT = "4100"

try {
  New-Item -ItemType Directory -Path $temporaryRoot | Out-Null
  New-Item -ItemType Junction -Path $asciiProject -Target $projectRoot | Out-Null
  Set-Location -LiteralPath $asciiProject

  npm run build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  npm --prefix backend run build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  $env:NODE_ENV = "development"
  & $firebaseCli emulators:exec --only auth,firestore --project demo-sa3erli-sprint05 "powershell -NoProfile -ExecutionPolicy Bypass -File backend/scripts/local-session.ps1"
  $exitCode = $LASTEXITCODE
} finally {
  Set-Location -LiteralPath $previousLocation
  if (Test-Path -LiteralPath $asciiProject) { [System.IO.Directory]::Delete($asciiProject) }
  if (Test-Path -LiteralPath $temporaryRoot) { Remove-Item -LiteralPath $temporaryRoot -Recurse -Force }
}

exit $exitCode
