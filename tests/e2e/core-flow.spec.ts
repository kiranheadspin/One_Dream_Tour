import { expect, test } from "@playwright/test";

test("public page presents verified tournament facts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "One Dream Cup" })).toBeVisible();
  await expect(page.getByTestId("hero-prize-pool")).toContainText("₹2,80,000");
  await expect(page.getByTestId("prize-breakdown")).toContainText("Winner₹1,50,000");
  await expect(page.getByTestId("prize-breakdown")).toContainText("Runner-up₹50,000");
  await expect(page.getByTestId("prize-breakdown")).toContainText("8 qualifying teams₹10,000 each");
  await expect(page.getByRole("link", { name: /Register team interest/i })).toBeVisible();
  await expect(page.getByTestId("road-to-goa-link")).toHaveAttribute("href", "/road-to-goa");
});

test("mobile public navigation closes after selecting a page", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "The navigation drawer is mobile-only.");

  for (const [label, route] of [
    ["Tournament", "/tournament"],
    ["Cities", "/cities"],
    ["Road to Goa", "/road-to-goa"],
    ["Rules", "/rules"],
    ["FAQ", "/faq"],
    ["Corporate Events", "/corporate-events"],
  ]) {
    await page.goto("/");
    await page.getByLabel("Open navigation").click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
    await page.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeHidden();
  }
});

test("global loading indicator gives non-blocking feedback for client-side writes", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "One Dream Cup" })).toBeVisible({ timeout: 60_000 });
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.loadingIndicatorReady)).toBe("true");
  await page.route("**/api/loading-contract", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({ status: 204 });
  });

  await page.evaluate(() => {
    void fetch("/api/loading-contract", { method: "POST" });
  });

  const indicator = page.getByTestId("global-loading-indicator");
  await expect(indicator).toBeVisible();
  await expect(indicator).toContainText("Saving changes");
  await expect(indicator).toBeHidden();
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
  await expect(lead.locator("span.rounded-full", { hasText: "New" })).toBeVisible();
  const stage = lead.getByRole("combobox");
  await expect(stage).toHaveCount(1);
  await stage.selectOption("Qualified");
  await expect(stage).toHaveValue("Qualified");
  await page.goto("/admin/leads?batch=new");
  await expect(page.locator("tr:visible, article:visible").filter({ hasText: unique })).toHaveCount(0);
  await page.goto(`/admin/leads?q=${encodeURIComponent(unique)}`);
  const updatedLead = page.locator("tr:visible, article:visible").filter({ hasText: unique });
  const updatedStage = updatedLead.getByRole("combobox");
  await updatedStage.selectOption("Registration invited");
  await expect(updatedStage).toHaveValue("Registration invited");
});

test("demo roles are separated", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Preview captain portal/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/dashboard/);
  if ((page.viewportSize()?.width ?? 0) < 768) await page.getByLabel("Open workspace navigation").click();
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
  await page.getByRole("link", { name: "View Acme Blazers" }).click();
  await expect(page).toHaveURL(/\/admin\/teams\/demo-team-2$/);
  await expect(page.getByRole("heading", { name: "Acme Blazers" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Team members" })).toBeVisible();
  await expect(page.getByText("Arjun Rao").last()).toBeVisible();
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
  await page.getByLabel("EPFO number (optional)").fill("100000000019");
  await page.getByRole("button", { name: "Add player", exact: true }).click();
  await expect(page.getByRole("table").getByText("E2E Player")).toBeVisible();

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

  await page.goto("/dashboard/teams/not-owned");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "This page could not be found." })).toBeVisible();
});

test("captain player details stay readable and easy to add on mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile layout is covered in the mobile browser project.");
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  await page.goto("/login");
  await page.getByRole("button", { name: /Preview captain portal/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/?$/);
  await page.goto("/dashboard/team");

  await expect(page.getByTestId("player-mobile-list")).toBeVisible();
  await expect(page.getByTestId("player-mobile-card").first()).toContainText("EPFO number");
  await expect(page.getByText("Status", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Add player" }).click();
  await expect(page.getByLabel("EPFO number (optional)")).toBeVisible();
  await page.getByLabel("Full name").fill("Mobile E2E Player");
  await page.getByLabel("Work email").fill("mobile-player-e2e@example.com");
  await page.getByLabel("Phone").fill("+91 98765 43212");
  await page.getByLabel("Employee ID").fill("MOBILE-E2E-001");
  await page.getByRole("button", { name: "Add player", exact: true }).click();

  const addedPlayer = page.getByTestId("player-mobile-card").filter({ hasText: "Mobile E2E Player" });
  await expect(addedPlayer).toBeVisible();
  await expect(addedPlayer).toContainText("EPFO number");
  await expect(addedPlayer).toContainText("—");
  expect(browserErrors).toEqual([]);
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

test("captain mobile dashboard navigation closes after changing routes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only dashboard navigation contract.");
  await page.goto("/login");
  await page.getByRole("button", { name: /Preview captain portal/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByLabel("Open workspace navigation").click();
  const navigation = page.getByRole("dialog", { name: "Captain portal" });
  await expect(navigation.getByLabel("Signed in profile")).toBeVisible();
  await expect(navigation.getByRole("button", { name: "Sign out" })).toBeVisible();
  await expect(navigation.getByRole("navigation", { name: "captain mobile navigation" })).toHaveCSS("overflow-y", "auto");
  await expect(navigation.getByRole("link", { name: "Public site" })).toHaveAttribute("href", "/");
  await navigation.getByRole("link", { name: "Rules" }).click();

  await expect(page).toHaveURL(/\/dashboard\/rules/);
  await expect(navigation).toBeHidden();
});

test("admin mobile dashboard navigation closes after changing routes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only dashboard navigation contract.");
  await page.goto("/login");
  await page.getByRole("button", { name: /Preview admin CRM/i }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.getByLabel("Open workspace navigation").click();
  const navigation = page.getByRole("dialog", { name: "Tournament CRM" });
  await expect(navigation.getByLabel("Signed in profile")).toBeVisible();
  await expect(navigation.getByRole("button", { name: "Sign out" })).toBeVisible();
  await expect(navigation.getByRole("navigation", { name: "admin mobile navigation" })).toHaveCSS("overflow-y", "auto");
  await expect(navigation.getByRole("link", { name: "Public site" })).toHaveAttribute("href", "/");
  await navigation.getByRole("link", { name: "Leads" }).click();

  await expect(page).toHaveURL(/\/admin\/leads/);
  await expect(navigation).toBeHidden();
});
