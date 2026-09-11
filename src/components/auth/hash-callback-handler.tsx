"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { parseAuthHash } from "@/lib/auth-hash-callback";

function loginPath(error: "invalid-link" | "missing-code") {
  return `/login?error=${error}`;
}

export function HashCallbackHandler({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("Completing secure sign-in...");

  useEffect(() => {
    let active = true;

    async function complete() {
      const parsed = parseAuthHash(window.location.hash);
      if (parsed.kind === "error") {
        router.replace(loginPath(parsed.error));
        return;
      }
      if (parsed.kind !== "session") {
        router.replace(loginPath("missing-code"));
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        router.replace(loginPath("missing-code"));
        return;
      }

      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      const { error } = await supabase.auth.setSession({
        access_token: parsed.accessToken,
        refresh_token: parsed.refreshToken,
      });
      if (!active) return;
      if (error) {
        router.replace(loginPath("invalid-link"));
        return;
      }

      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      setMessage("Opening your dashboard...");
      router.replace(nextPath);
      router.refresh();
    }

    void complete();
    return () => {
      active = false;
    };
  }, [nextPath, router]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f3ea] px-6">
      <div className="flex items-center gap-3 text-sm font-medium text-[#081326]">
        <Loader2 aria-hidden="true" className="size-5 animate-spin text-[#313999]" />
        {message}
      </div>
    </div>
  );
}
