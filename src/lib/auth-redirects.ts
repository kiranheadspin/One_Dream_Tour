import type { AppRole } from "@/lib/auth";

const ROLE_HOME: Record<AppRole, string> = {
  admin: "/admin",
  captain: "/dashboard",
};

export function safeRelativePath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 500) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;

  try {
    const url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function destinationForRole(role: AppRole, requestedPath?: unknown) {
  const safePath = safeRelativePath(requestedPath);
  const rolePrefix = ROLE_HOME[role];
  if (safePath === rolePrefix || safePath?.startsWith(`${rolePrefix}/`)) return safePath;
  return rolePrefix;
}
