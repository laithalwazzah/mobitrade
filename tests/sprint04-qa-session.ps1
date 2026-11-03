$ErrorActionPreference = "Stop"

npm run qa:sprint04:reseed -- status
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4000/add"
if ($response.StatusCode -ne 200) { throw "Local QA site did not respond on port 4000." }

Write-Host ""
Write-Host "Sprint 04 local QA is ready at http://127.0.0.1:4000"
Write-Host "Use another PowerShell window for reset/reseed commands documented in SPRINT_04_TEST.md."

if ($env:SPRINT04_QA_AUTOMATED -eq "1") {
  npx playwright test --config=playwright.sprint04-emulator.config.ts
  exit $LASTEXITCODE
}

if ($env:SPRINT04_QA_NONINTERACTIVE -eq "1") {
  foreach ($scenario in @("duplicate", "failure", "privacy", "status")) {
    npm run qa:sprint04:reseed -- $scenario
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  }
  Write-Host "Non-interactive smoke session completed."
  exit 0
}

Read-Host "Press Enter after manual QA to stop Hosting, Auth, and Firestore emulators"
