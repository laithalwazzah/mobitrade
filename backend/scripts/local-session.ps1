$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$logRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("sa3erli-sprint05-" + [guid]::NewGuid().ToString("N"))
$backendProcess = $null
$frontendProcess = $null

try {
  New-Item -ItemType Directory -Path $logRoot | Out-Null
  npm --prefix backend run seed:emulator
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  $frontendProcess = Start-Process -FilePath "node" -ArgumentList "backend/scripts/static-server.mjs" -WorkingDirectory $projectRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logRoot "frontend.stdout.log") -RedirectStandardError (Join-Path $logRoot "frontend.stderr.log")
  $backendProcess = Start-Process -FilePath "node" -ArgumentList "backend/dist/main.js" -WorkingDirectory $projectRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logRoot "backend.stdout.log") -RedirectStandardError (Join-Path $logRoot "backend.stderr.log")

  $ready = $false
  for ($attempt = 0; $attempt -lt 60; $attempt++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4100/api/v1/health/ready" -TimeoutSec 1
      if ($response.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Start-Sleep -Milliseconds 250
  }
  if (-not $ready) { throw "Backend did not become ready on port 4100." }
  $frontend = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4000" -TimeoutSec 5
  if ($frontend.StatusCode -ne 200) { throw "Static frontend did not become ready on port 4000." }

  Write-Host "Frontend: http://localhost:4000"
  Write-Host "Backend health: http://127.0.0.1:4100/api/v1/health/ready"
  Write-Host "OpenAPI: http://127.0.0.1:4100/api/v1/docs"
  Write-Host "Dummy Auth Emulator fixtures are seeded. Press Enter to stop everything."
  [void](Read-Host)
} finally {
  if ($backendProcess -and -not $backendProcess.HasExited) {
    Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
    $backendProcess.WaitForExit(5000)
  }
  if ($frontendProcess -and -not $frontendProcess.HasExited) {
    Stop-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue
    $frontendProcess.WaitForExit(5000)
  }
  if (Test-Path -LiteralPath $logRoot) { Remove-Item -LiteralPath $logRoot -Recurse -Force }
}
