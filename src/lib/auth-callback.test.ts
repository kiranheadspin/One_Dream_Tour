import { describe, expect, it } from "vitest";
import { getAuthCallbackParams } from "@/lib/auth-callback";

describe("getAuthCallbackParams", () => {
  it("accepts Supabase PKCE code callbacks", () => {
    const url = new URL("https://onedreamcup.vercel.app/auth/callback?code=abc&next=/dashboard");
    expect(getAuthCallbackParams(url)).toEqual({ method: "code", code: "abc", next: "/dashboard" });
  });

  it("accepts token-hash email callbacks", () => {
    const url = new URL("https://onedreamcup.vercel.app/auth/callback?token_hash=hashed&type=email&next=/dashboard");
    expect(getAuthCallbackParams(url)).toEqual({ method: "token_hash", tokenHash: "hashed", type: "email", next: "/dashboard" });
  });

  it("rejects callbacks without usable auth material", () => {
    expect(getAuthCallbackParams(new URL("https://onedreamcup.vercel.app/auth/callback?next=/dashboard"))).toBeNull();
    expect(getAuthCallbackParams(new URL("https://onedreamcup.vercel.app/auth/callback?token_hash=hashed&type=recovery"))).toBeNull();
  });
});
