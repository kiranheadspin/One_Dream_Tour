import { access, copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";

export default async function globalSetup() {
  const dataDirectory = path.join(process.cwd(), ".data");
  const dataFile = path.join(dataDirectory, "one-dream-cup-demo.json");
  const backupFile = path.join(dataDirectory, "one-dream-cup-demo.e2e-backup.json");
  await mkdir(dataDirectory, { recursive: true });
  const interruptedRunBackupExists = await access(backupFile).then(() => true).catch(() => false);
  if (interruptedRunBackupExists) {
    await copyFile(backupFile, dataFile);
    await rm(backupFile, { force: true });
  }
  await copyFile(dataFile, backupFile).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
  await rm(dataFile, { force: true });
}
