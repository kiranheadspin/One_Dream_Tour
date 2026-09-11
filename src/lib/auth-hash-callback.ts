export type AuthHashResult =
  | { kind: "session"; accessToken: string; refreshToken: string }
  | { kind: "error"; error: "invalid-link" | "missing-code" }
  | { kind: "missing" };

export function parseAuthHash(hash: string): AuthHashResult {
  const value = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!value) return { kind: "missing" };

  const params = new URLSearchParams(value);
  const error = params.get("error");
  const errorCode = params.get("error_code");
  if (error || errorCode) {
    return { kind: "error", error: errorCode === "otp_expired" || error === "access_denied" ? "invalid-link" : "missing-code" };
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) return { kind: "session", accessToken, refreshToken };

  return { kind: "missing" };
}
