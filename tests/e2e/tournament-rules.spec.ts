import { expect, test } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { RULES_SECTIONS, RULES_VERSION } from "../../src/lib/tournament-rules";

test("S50 rules remain consistent through captain review and versioned acceptance", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/rules");
  await expect(page).toHaveTitle(/Tournament rules for the 50th edition/);
  await expect(page.getByRole("heading", { name: "Tournament rules for the 50th edition." })).toBeVisible();
  for (const section of RULES_SECTIONS) await expect(page.getByRole("heading", { name: section.title, exact: true })).toBeVisible();
  const pdfLink = page.getByRole("link", { name: "Read the original S50 brochure (PDF)" });
  const pdf = await page.request.get((await pdfLink.getAttribute("href"))!);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (process.env.S50_QA_DIR) await page.screenshot({ path: path.join(process.env.S50_QA_DIR, `rules-${testInfo.project.name}.png`) });

  expect((await page.request.post("/api/demo/session", { data: { role: "captain" } })).status()).toBe(200);
  await page.goto("/dashboard/rules");
  // The project global setup backs up demo data; this is a local test fixture.
  const dataPath = path.join(process.cwd(), ".data/one-dream-cup-demo.json");
  const database = JSON.parse(await readFile(dataPath, "utf8"));
  database.teams[0].rulesVersion = "2026-draft";
  database.teams[0].rulesAcceptedAt = "2026-09-13T00:00:00Z";
  await writeFile(dataPath, JSON.stringify(database));
  await page.reload();
  await expect(page.getByText(/Previous acceptance: 2026-draft/)).toBeVisible();
  await expect(page.getByText(/PF\/EPFO entry is optional/)).toBeVisible();
  expect((await page.request.post("/api/captain/rules", { data: { version: "2026-draft", accepted: true } })).status()).toBe(409);
  for (const route of ["/api/payments/order", "/api/payments/manual-submit"]) {
    const response = await page.request.post(route, { headers: { "idempotency-key": `s50-stale-${testInfo.project.name}` }, data: {} });
    expect(response.status()).toBe(409);
    expect((await response.json()).error).toContain("current rules version");
  }
  const button = page.getByRole("button", { name: "Record acceptance" });
  await expect(button).toBeDisabled();
  await page.getByRole("checkbox").check();
  await button.click();
  await expect(page.getByText(`Rules version ${RULES_VERSION} accepted on`, { exact: false })).toBeVisible();
  const accepted = JSON.parse(await readFile(dataPath, "utf8"));
  expect(accepted.teams[0].rulesVersion).toBe(RULES_VERSION);
  expect(accepted.audit.some((entry: { action: string; metadata: { previous?: { version?: string } } }) => entry.action === "rules.accepted" && entry.metadata.previous?.version === "2026-draft")).toBe(true);
  const timestamp = accepted.teams[0].rulesAcceptedAt;
  expect((await page.request.post("/api/captain/rules", { data: { version: RULES_VERSION, accepted: true } })).status()).toBe(200);
  expect(JSON.parse(await readFile(dataPath, "utf8")).teams[0].rulesAcceptedAt).toBe(timestamp);
  await page.reload();
  await expect(page.getByText(`Rules version ${RULES_VERSION} accepted on`, { exact: false })).toBeVisible();
  await page.getByText(`Rules version ${RULES_VERSION} accepted on`, { exact: false }).scrollIntoViewIfNeeded();
  if (process.env.S50_QA_DIR) await page.screenshot({ path: path.join(process.env.S50_QA_DIR, `accepted-${testInfo.project.name}.png`) });
  await page.goto("/dashboard/documents");
  await expect(page.getByRole("heading", { name: "Employment verification" })).toBeVisible();
  await expect(page.getByText(/Online document upload is not available/)).toBeVisible();
  await page.goto("/dashboard/team");
  await page.getByRole("button", { name: "Add player", exact: true }).click();
  await expect(page.getByLabel("EPFO number (optional)")).not.toHaveAttribute("required");
  await expect(page.getByRole("dialog").getByText(/PF number is required during eligibility verification/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.request.post("/api/demo/session", { data: { role: "admin" } });
  await page.goto(`/admin/teams/${accepted.teams[0].id}`);
  await expect(page.getByText(/Current version/, { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Eligibility verification" })).toBeVisible();
  await expect(page.getByText(/roster entries have no PF\/EPFO number recorded/)).toBeVisible();
  await expect(page.locator("nextjs-dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});
