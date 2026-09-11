import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const authConfig = readFileSync(path.join(process.cwd(), "supabase/config.toml"), "utf8");

describe("hosted Supabase Auth configuration", () => {
  it("keeps identity creation invite-only", () => {
    expect(authConfig).toContain("enable_signup = false");
    expect(authConfig).toContain("[auth.email]\nenable_signup = false");
    expect(authConfig).toContain("enable_anonymous_sign_ins = false");
    expect(authConfig).toContain("enable_manual_linking = false");
  });

  it("uses the production site without email callback routes", () => {
    expect(authConfig).toContain('site_url = "https://onedreamcup.vercel.app"');
    expect(authConfig).toContain("additional_redirect_urls = []");
  });

  it("uses hardened password sessions and MFA settings", () => {
    expect(authConfig).toContain("enable_refresh_token_rotation = true");
    expect(authConfig).toContain("minimum_password_length = 10");
    expect(authConfig).toContain('password_requirements = "lower_upper_letters_digits"');
    expect(authConfig).toContain("secure_password_change = true");
    expect(authConfig).toContain("enroll_enabled = true");
    expect(authConfig).toContain("verify_enabled = true");
  });
});
