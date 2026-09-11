import { copyFile, rm } from "node:fs/promises";
import path from "node:path";

export default async function globalTeardown() {
  const dataDirectory = path.join(process.cwd(), ".data");
  const dataFile = path.join(dataDirectory, "one-dream-cup-demo.json");
  const backupFile = path.join(dataDirectory, "one-dream-cup-demo.e2e-backup.json");
  const restored = await copyFile(backupFile, dataFile).then(() => true).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return false;
    throw error;
  });
  if (!restored) await rm(dataFile, { force: true });
  await rm(backupFile, { force: true });
}
