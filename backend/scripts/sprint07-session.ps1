$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$logRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("sa3erli-sprint07-session-" + [guid]::NewGuid().ToString("N"))
$backendProcess = $null
$frontendProcess = $null
try {
  New-Item -ItemType Directory -Path $logRoot | Out-Null
  npm --prefix backend run seed:sprint07 -- drift
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  npm --prefix backend run verify:sprint07:summary
  if ($LASTEXITCODE -ne 2) { throw "Drift verifier did not report the expected mismatch." }
  npm --prefix backend run repair:sprint07:summary
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  npm --prefix backend run verify:sprint07:summary
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  npm --prefix backend run seed:sprint07
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  npm --prefix backend run verify:sprint07:summary
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
  if ($env:SPRINT07_AUTOMATED -eq "1") {
    npx playwright test tests/e2e/sprint07-emulator.spec.ts --config=playwright.sprint07.config.ts
    exit $LASTEXITCODE
  }
  Write-Host "Frontend: http://127.0.0.1:4000/admin"
  Write-Host "Backend/OpenAPI: http://127.0.0.1:4100/api/v1/docs"
  Write-Host "Summary verifier: npm --prefix backend run verify:sprint07:summary"
  Write-Host "Dummy Sprint 07 accounts and 3 pending / 2 approved / 2 rejected records are ready. Press Enter to stop cleanly."
  [void](Read-Host)
} finally {
  if ($backendProcess -and -not $backendProcess.HasExited) { Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue; $backendProcess.WaitForExit(5000) }
  if ($frontendProcess -and -not $frontendProcess.HasExited) { Stop-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue; $frontendProcess.WaitForExit(5000) }
  if (Test-Path -LiteralPath $logRoot) { Remove-Item -LiteralPath $logRoot -Recurse -Force }
}
