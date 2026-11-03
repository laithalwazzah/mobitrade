$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("sa3erli-firestore-" + [guid]::NewGuid().ToString("N"))
$asciiProject = Join-Path $temporaryRoot "project"
$previousLocation = Get-Location
$exitCode = 1
$env:DEBUG = ""

try {
  New-Item -ItemType Directory -Path $temporaryRoot | Out-Null
  New-Item -ItemType Junction -Path $asciiProject -Target $projectRoot | Out-Null
  Set-Location -LiteralPath $asciiProject
  & npx --no-install firebase emulators:exec --only firestore --project demo-sa3erli-sprint04 "npm run test:rules:unit"
  $exitCode = $LASTEXITCODE
} finally {
  Set-Location -LiteralPath $previousLocation
  if (Test-Path -LiteralPath $asciiProject) {
    [System.IO.Directory]::Delete($asciiProject)
  }
  if (Test-Path -LiteralPath $temporaryRoot) {
    Remove-Item -LiteralPath $temporaryRoot
  }
}

exit $exitCode
