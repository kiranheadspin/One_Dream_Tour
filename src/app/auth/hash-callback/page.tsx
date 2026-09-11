import { HashCallbackHandler } from "@/components/auth/hash-callback-handler";
import { safeRelativePath } from "@/lib/auth-redirects";

export default async function HashCallbackPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const query = await searchParams;
  const nextPath = safeRelativePath(query.next) ?? "/dashboard";
  return <HashCallbackHandler nextPath={nextPath} />;
}
