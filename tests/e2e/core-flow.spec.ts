import { expect, test } from "@playwright/test";

test("public page presents verified tournament facts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "One Dream Cup" })).toBeVisible();
  await expect(page.getByTestId("hero-prize-pool")).toContainText("₹2,50,000");
  await expect(page.getByTestId("prize-breakdown")).toContainText("Winner₹1,50,000");
  await expect(page.getByTestId("prize-breakdown")).toContainText("Runner-up₹50,000");
  await expect(page.getByTestId("prize-breakdown")).toContainText("Losing semi-finalists₹10,000 each");
  await expect(page.getByTestId("prize-breakdown")).toContainText("Losing quarter-finalists₹5,000 each");
  await expect(page.getByRole("link", { name: /Register team interest/i })).toBeVisible();
  await expect(page.getByTestId("road-to-goa-link")).toHaveAttribute("href", "/road-to-goa");
});

test("public information pages share the home page register-interest CTA", async ({ page }) => {
  for (const route of ["/tournament", "/cities", "/road-to-goa", "/rules", "/sponsors", "/faq"]) {
    await page.goto(route);
    const cta = page.getByTestId("page-register-interest");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/register");
    await expect(cta).toHaveCSS("background-color", "rgb(215, 170, 84)");
    await expect(cta).toHaveCSS("color", "rgb(8, 19, 38)");
  }
});

test("sponsors page lists Our Genie App and its official website", async ({ page }) => {
  await page.goto("/sponsors");
  await expect(page.getByRole("heading", { name: "Brands backing One Dream Cup." })).toBeVisible();
  const sponsor = page.getByRole("link", { name: /Visit Our Genie App website/i });
  await expect(sponsor).toBeVisible();
  await expect(sponsor).toHaveAttribute("href", "https://www.ourgenieapp.com/");
  await expect(sponsor).toContainText("Our Genie App");
});

test("visitor can submit the short enquiry and receive a reference", async ({ page }, testInfo) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `2001:db8:${Date.now().toString(16)}::1` });
  await page.goto("/register");
  const unique = `${testInfo.project.name.replaceAll("-", "")}@e2e.example`;
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Test Captain");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(unique);
  const phone = page.getByRole("textbox", { name: "Phone number", exact: true });
  await phone.press("End");
  await phone.type("9876543210");
  await page.getByRole("textbox", { name: "Organization", exact: true }).fill("E2E Company");
  await page.getByText("Pune", { exact: true }).click();
  await page.getByRole("checkbox", { name: /genuine corporate team/i }).check();
  await page.getByRole("button", { name: /Register my team/i }).click();
  await expect(page).toHaveURL(/\/register\/success\?reference=ODC-/);
  await expect(page.getByText(/ODC-/)).toBeVisible();

  await page.goto("/login");
  await page.getByRole("button", { name: /Preview admin CRM/i }).click();
  await expect(page).toHaveURL(/\/admin/);
  await page.goto(`/admin/leads?q=${encodeURIComponent(unique)}`);
  const lead = page.locator("tr:visible, article:visible").filter({ hasText: unique });
  await expect(lead).toContainText(unique);
  const stage = lead.getByRole("combobox");
  await expect(stage).toHaveCount(1);
  await stage.selectOption("Qualified");
  await expect(stage).toHaveValue("Qualified");
  await stage.selectOption("Registration invited");
  await expect(stage).toHaveValue("Registration invited");
});

test("demo roles are separated", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Preview captain portal/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto("/login");
  await page.getByRole("button", { name: /Preview admin CRM/i }).click();
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole("heading", { name: "Tournament pipeline" })).toBeVisible();
});

test("an authenticated visitor is offered their role dashboard instead of login", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Preview admin CRM/i }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/");
  if ((page.viewportSize()?.width ?? 0) < 1024) await page.getByLabel("Open navigation").click();
  const dashboardLink = page.getByRole("link", { name: "Go to dashboard" });
  await expect(dashboardLink).toHaveAttribute("href", "/admin");

  await dashboardLink.click();
  await expect(page).toHaveURL(/\/admin/);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/admin/);
});

test("admin teams include synthetic captains and pre-built enquiries", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Preview admin CRM/i }).click();
  await expect(page).toHaveURL(/\/admin/);
  await page.goto("/admin/teams");
  await expect(page.getByRole("heading", { name: "Teams" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Acme Blazers" })).toBeVisible();
  await expect(page.getByText("Arjun Rao")).toBeVisible();
  await expect(page.getByText("Enquiry ODC-260801")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(7);
});

test("captain submits a UPI payment and admin confirms receipt", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Full mutation flow runs once against the shared demo store.");
  test.setTimeout(60_000);
  await page.goto("/login");
  await page.getByRole("button", { name: /Preview captain portal/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.goto("/dashboard/team");
  await page.getByRole("button", { name: "Add player" }).click();
  await page.getByLabel("Full name").fill("E2E Player");
  await page.getByLabel("Work email").fill("player-e2e@example.com");
  await page.getByLabel("Phone").fill("+91 98765 43211");
  await page.getByLabel("Employee ID").fill("E2E-001");
  await page.getByLabel("Shirt size").selectOption("L");
  await page.getByRole("button", { name: "Add player", exact: true }).click();
  await expect(page.getByText("E2E Player")).toBeVisible();

  await page.goto("/dashboard/rules");
  await page.getByText(/I have reviewed this displayed rules version/i).click();
  await page.getByRole("button", { name: "Record acceptance" }).click();
  await expect(page.getByText(/accepted on/i)).toBeVisible();

  await page.goto("/dashboard/payment");
  await expect(page.getByText("masterstroke.in-2@okaxis").first()).toBeVisible();
  const upiPaymentLink = page.locator('a[href^="upi://pay?"]');
  await expect(upiPaymentLink).toHaveCount(1);
  await expect(upiPaymentLink).toHaveAttribute("href", /pa=masterstroke\.in-2%40okaxis/);
  await page.getByRole("button", { name: "Payment done" }).click();
  await page.getByLabel("UPI transaction ID (optional)").fill("624512345678");
  await page.getByRole("button", { name: "Send for review" }).click();
  await expect(page.getByText(/Waiting for organizer confirmation/i)).toBeVisible();
  await expect(page.getByText("624512345678")).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto("/login");
  await page.getByRole("button", { name: /Preview admin CRM/i }).click();
  await expect(page).toHaveURL(/\/admin/);
  await page.goto("/admin/payments");
  const paymentRow = page.getByRole("row").filter({ hasText: "Northstar Strikers" });
  await expect(paymentRow).toContainText("Awaiting confirmation");
  await paymentRow.getByRole("button", { name: "Review" }).click();
  await page.getByRole("button", { name: "Confirm received" }).click();
  await expect(paymentRow).toContainText("Payment confirmed");

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto("/login");
  await page.getByRole("button", { name: /Preview captain portal/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.goto("/dashboard/confirmation");
  await expect(page.getByRole("heading", { name: "Your team is registered." })).toBeVisible();
  await page.goto("/dashboard/receipt");
  await expect(page.getByRole("heading", { name: "Northstar Strikers" })).toBeVisible();

  await page.goto("/dashboard/preferences");
  const marketing = page.getByRole("checkbox", { name: /Future event updates/i });
  await marketing.check();
  await page.getByRole("button", { name: "Save preference" }).click();
  await expect(page.getByText("Preference saved.")).toBeVisible();
  await marketing.uncheck();
  await page.getByRole("button", { name: "Save preference" }).click();
  await expect(page.getByText("Preference saved.")).toBeVisible();

  const denied = await page.goto("/dashboard/teams/not-owned");
  expect(denied?.status()).toBe(404);
});

test("mobile navigation exposes primary destinations", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only navigation contract.");
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog", { name: "One Dream Cup" })).toBeVisible();
  await expect(page.getByTestId("mobile-road-to-goa-link")).toBeVisible();
  await expect(page.getByRole("link", { name: "Captain login" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Corporate Events" })).toBeVisible();
});
