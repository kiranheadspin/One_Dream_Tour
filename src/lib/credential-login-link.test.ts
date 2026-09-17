import { describe, expect, it } from "vitest";
import { buildCaptainLoginUrl, credentialsFromLoginFragment } from "@/lib/credential-login-link";

describe("captain credential login links", () => {
  it("places credentials in the fragment rather than the HTTP request URL", () => {
    const link = buildCaptainLoginUrl("https://onedreamcup.vercel.app", "captain.1234", "Secr3tPass");
    const url = new URL(link);

    expect(`${url.origin}${url.pathname}${url.search}`).toBe("https://onedreamcup.vercel.app/login");
    expect(url.hash).toBe("#username=captain.1234&password=Secr3tPass");
  });

  it("accepts valid credentials and rejects absent or oversized values", () => {
    expect(credentialsFromLoginFragment("#username=captain.1234&password=Secr3tPass")).toEqual({ username: "captain.1234", password: "Secr3tPass" });
    expect(credentialsFromLoginFragment("#username=captain.1234")).toBeNull();
    expect(credentialsFromLoginFragment(`#username=${"a".repeat(181)}&password=Secr3tPass`)).toBeNull();
  });
});
