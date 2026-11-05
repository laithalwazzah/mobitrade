$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$logRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("sa3erli-sprint06-session-" + [guid]::NewGuid().ToString("N"))
$backendProcess = $null
$frontendProcess = $null
try {
  New-Item -ItemType Directory -Path $logRoot | Out-Null
  npm --prefix backend run seed:sprint06
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  $frontendProcess = Start-Process -FilePath "node" -ArgumentList "backend/scripts/static-server.mjs" -WorkingDirectory $projectRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logRoot "frontend.stdout.log") -RedirectStandardError (Join-Path $logRoot "frontend.stderr.log")
  $backendProcess = Start-Process -FilePath "node" -ArgumentList "backend/dist/main.js" -WorkingDirectory $projectRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logRoot "backend.stdout.log") -RedirectStandardError (Join-Path $logRoot "backend.stderr.log")
  $ready = $false
  for ($attempt = 0; $attempt -lt 80; $attempt++) {
    try { if ((Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4100/api/v1/health/ready" -TimeoutSec 1).StatusCode -eq 200) { $ready = $true; break } } catch {}
    Start-Sleep -Milliseconds 250
  }
  if (-not $ready) { throw "Backend did not become ready on port 4100." }
  if ((Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4000" -TimeoutSec 5).StatusCode -ne 200) { throw "Frontend did not become ready." }
  if ($env:SPRINT06_AUTOMATED -eq "1") {
    npm run qa:sprint06:verify-atomicity
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    npx playwright test tests/e2e/sprint06-emulator.spec.ts --config=playwright.sprint06.config.ts
    exit $LASTEXITCODE
  }
  Write-Host "Frontend: http://127.0.0.1:4000"
  Write-Host "Backend/OpenAPI: http://127.0.0.1:4100/api/v1/docs"
  Write-Host "Atomicity verifier (run in another PowerShell): npm run qa:sprint06:verify-atomicity"
  Write-Host "Dummy Sprint 06 accounts and pending/approved/rejected records are ready. Press Enter to stop cleanly."
  [void](Read-Host)
} finally {
  if ($backendProcess -and -not $backendProcess.HasExited) { Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue; $backendProcess.WaitForExit(5000) }
  if ($frontendProcess -and -not $frontendProcess.HasExited) { Stop-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue; $frontendProcess.WaitForExit(5000) }
  if (Test-Path -LiteralPath $logRoot) { Remove-Item -LiteralPath $logRoot -Recurse -Force }
}
