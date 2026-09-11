import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const authConfig = readFileSync(path.join(process.cwd(), "supabase/config.toml"), "utf8");

describe("hosted Supabase Auth configuration", () => {
  it("keeps identity creation invite-only", () => {
    expect(authConfig).toContain("enable_signup = false");
    expect(authConfig).toContain("[auth.email]\nenable_signup = true");
    expect(authConfig).toContain("enable_anonymous_sign_ins = false");
    expect(authConfig).toContain("enable_manual_linking = false");
  });

  it("allows only the temporary production application callback", () => {
    expect(authConfig).toContain('site_url = "https://onedreamcup.vercel.app"');
    expect(authConfig).toContain('"https://onedreamcup.vercel.app/auth/callback"');
    expect(authConfig).not.toContain('"http://localhost:3000/auth/callback"');
  });

  it("uses rotated sessions and preserves hardened email and MFA settings", () => {
    expect(authConfig).toContain("enable_refresh_token_rotation = true");
    expect(authConfig).toContain("double_confirm_changes = true");
    expect(authConfig).toContain("secure_password_change = true");
    expect(authConfig).toContain("otp_length = 8");
    expect(authConfig).toContain("enroll_enabled = true");
    expect(authConfig).toContain("verify_enabled = true");
  });
});
