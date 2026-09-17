const MAX_IDENTIFIER_LENGTH = 180;
const MAX_PASSWORD_LENGTH = 200;

export function buildCaptainLoginUrl(siteUrl: string, username: string, password: string) {
  const url = new URL("/login", siteUrl);
  url.hash = new URLSearchParams({ username, password }).toString();
  return url.toString();
}

export function credentialsFromLoginFragment(fragment: string) {
  const params = new URLSearchParams(fragment.startsWith("#") ? fragment.slice(1) : fragment);
  const username = params.get("username")?.trim() ?? "";
  const password = params.get("password") ?? "";
  if (!username || !password || username.length > MAX_IDENTIFIER_LENGTH || password.length > MAX_PASSWORD_LENGTH) return null;
  return { username, password };
}
