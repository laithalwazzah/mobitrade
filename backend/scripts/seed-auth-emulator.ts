import { resetAuthEmulator, seedAuthEmulator } from "./emulator-fixtures";

async function main(): Promise<void> {
  await resetAuthEmulator();
  const fixtures = await seedAuthEmulator();
  console.log(JSON.stringify({
    projectId: "demo-sa3erli-sprint05",
    liveFirebaseUsed: false,
    fixtures: Object.fromEntries(Object.entries(fixtures).map(([name, value]) => [name, { uid: value.uid }])),
  }));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Fixture seed failed");
  process.exitCode = 1;
});
