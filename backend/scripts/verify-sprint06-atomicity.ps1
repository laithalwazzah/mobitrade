$ErrorActionPreference = "Stop"
$env:BACKEND_EMULATOR_MODE = "1"
$env:FIREBASE_PROJECT_ID = "demo-sa3erli-sprint05"
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"
$env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
npm --prefix backend run verify:sprint06:atomicity
exit $LASTEXITCODE
