import { describe, expect, it } from "vitest";
import { destinationForRole, safeRelativePath } from "@/lib/auth-redirects";

describe("safeRelativePath", () => {
  it("accepts same-site relative paths", () => {
    expect(safeRelativePath("/dashboard/team?tab=players")).toBe("/dashboard/team?tab=players");
  });

  it.each(["https://evil.example", "//evil.example/path", "/\\evil.example", "dashboard"]) (
    "rejects unsafe redirect %s",
    (path) => expect(safeRelativePath(path)).toBeNull(),
  );
});

describe("destinationForRole", () => {
  it("keeps destinations inside the authenticated role area", () => {
    expect(destinationForRole("admin", "/admin/leads")).toBe("/admin/leads");
    expect(destinationForRole("captain", "/dashboard/players")).toBe("/dashboard/players");
  });

  it("does not let one role enter the other role area", () => {
    expect(destinationForRole("captain", "/admin")).toBe("/dashboard");
    expect(destinationForRole("admin", "/dashboard")).toBe("/admin");
  });
});
