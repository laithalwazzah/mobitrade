$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("sa3erli-sprint04-qa-" + [guid]::NewGuid().ToString("N"))
$asciiProject = Join-Path $temporaryRoot "project"
$previousLocation = Get-Location
$exitCode = 1

$env:DEBUG = ""
$env:NEXT_PUBLIC_FIREBASE_EMULATOR_MODE = "1"
$env:NEXT_PUBLIC_FIREBASE_API_KEY = "demo-api-key"
$env:NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "demo-sa3erli-sprint04.localhost"
$env:NEXT_PUBLIC_FIREBASE_PROJECT_ID = "demo-sa3erli-sprint04"
$env:NEXT_PUBLIC_FIREBASE_APP_ID = "demo-app-id"

try {
  New-Item -ItemType Directory -Path $temporaryRoot | Out-Null
  New-Item -ItemType Junction -Path $asciiProject -Target $projectRoot | Out-Null
  Set-Location -LiteralPath $asciiProject

  npm run build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  & npx --no-install firebase emulators:exec --only auth,firestore,hosting --project demo-sa3erli-sprint04 "powershell -NoProfile -ExecutionPolicy Bypass -File tests/sprint04-qa-session.ps1"
  $exitCode = $LASTEXITCODE
} finally {
  Set-Location -LiteralPath $previousLocation
  if (Test-Path -LiteralPath $asciiProject) { [System.IO.Directory]::Delete($asciiProject) }
  if (Test-Path -LiteralPath $temporaryRoot) { Remove-Item -LiteralPath $temporaryRoot }
}

exit $exitCode
