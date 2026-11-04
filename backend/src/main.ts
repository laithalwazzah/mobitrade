import { loadBackendConfig } from "./config/backend-config";
import { createApplication } from "./bootstrap";

async function main(): Promise<void> {
  const config = loadBackendConfig();
  const app = await createApplication(config);
  await app.listen(config.port, "127.0.0.1");
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown startup error";
  console.error(JSON.stringify({ level: "error", event: "startup_failed", message }));
  process.exitCode = 1;
});
