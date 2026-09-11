import { describe, expect, it } from "vitest";
import { parseAuthHash } from "@/lib/auth-hash-callback";

describe("parseAuthHash", () => {
  it("extracts implicit Supabase sessions", () => {
    expect(parseAuthHash("#access_token=access&refresh_token=refresh&type=magiclink")).toEqual({
      kind: "session",
      accessToken: "access",
      refreshToken: "refresh",
    });
  });

  it("maps expired OTP fragments to invalid-link", () => {
    expect(parseAuthHash("#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired")).toEqual({
      kind: "error",
      error: "invalid-link",
    });
  });

  it("reports missing hash auth material", () => {
    expect(parseAuthHash("")).toEqual({ kind: "missing" });
    expect(parseAuthHash("#sb=")).toEqual({ kind: "missing" });
  });
});
