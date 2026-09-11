const EMAIL_OTP_TYPES = new Set(["email", "magiclink", "invite"]);

export type AuthCallbackParams =
  | { method: "code"; code: string; next: string | null }
  | { method: "token_hash"; tokenHash: string; type: "email" | "magiclink" | "invite"; next: string | null };

export function getAuthCallbackParams(url: URL): AuthCallbackParams | null {
  const next = url.searchParams.get("next");
  const code = url.searchParams.get("code");
  if (code) return { method: "code", code, next };

  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (tokenHash && type && EMAIL_OTP_TYPES.has(type)) {
    return { method: "token_hash", tokenHash, type: type as "email" | "magiclink" | "invite", next };
  }

  return null;
}
