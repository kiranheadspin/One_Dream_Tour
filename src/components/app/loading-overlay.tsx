"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const NAVIGATION_EVENT = "one-dream:loading-start";

function isInternalNavigation(anchor: HTMLAnchorElement) {
  if (anchor.target || anchor.hasAttribute("download")) return false;
  const destination = new URL(anchor.href, window.location.href);
  if (destination.origin !== window.location.origin) return false;
  return destination.pathname !== window.location.pathname || destination.search !== window.location.search;
}

function isWriteRequest(input: RequestInfo | URL, init?: RequestInit) {
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  if (method === "GET" || method === "HEAD") return false;
  const rawUrl = input instanceof Request ? input.url : input.toString();
  return new URL(rawUrl, window.location.href).origin === window.location.origin;
}

/**
 * Provides immediate feedback for app navigation and client-side writes without
 * hiding the work the user was doing. Route-level loading.tsx files show a
 * page-shaped skeleton while server content streams.
 */
export function GlobalLoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigation, setNavigation] = useState<{ label: string; routeKey: string } | null>(null);
  const [pendingWrites, setPendingWrites] = useState(0);
  const pendingWritesRef = useRef(0);
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const navigationLabel = navigation?.routeKey === routeKey ? navigation.label : null;

  useEffect(() => {
    if (!navigationLabel) return;
    const timeout = window.setTimeout(() => setNavigation(null), 15_000);
    return () => window.clearTimeout(timeout);
  }, [navigationLabel]);

  useEffect(() => {
    const beginNavigation = (label = "Loading your next view") => setNavigation({ label, routeKey });

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (anchor && isInternalNavigation(anchor)) beginNavigation();
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!event.defaultPrevented && form instanceof HTMLFormElement) beginNavigation("Processing your request");
    };

    const onExternalNavigation = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail as { label?: unknown } | undefined : undefined;
      const label = typeof detail?.label === "string" ? detail.label : undefined;
      beginNavigation(label);
    };

    const originalFetch = window.fetch.bind(window);
    const trackedFetch: typeof window.fetch = async (input, init) => {
      const trackRequest = isWriteRequest(input, init);
      if (trackRequest) {
        pendingWritesRef.current += 1;
        setPendingWrites(pendingWritesRef.current);
      }
      try {
        return await originalFetch(input, init);
      } finally {
        if (trackRequest) {
          pendingWritesRef.current = Math.max(0, pendingWritesRef.current - 1);
          setPendingWrites(pendingWritesRef.current);
        }
      }
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit);
    window.addEventListener(NAVIGATION_EVENT, onExternalNavigation);
    window.fetch = trackedFetch;
    document.documentElement.dataset.loadingIndicatorReady = "true";

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit);
      window.removeEventListener(NAVIGATION_EVENT, onExternalNavigation);
      window.fetch = originalFetch;
      delete document.documentElement.dataset.loadingIndicatorReady;
    };
  }, [routeKey]);

  if (!navigationLabel && pendingWrites === 0) return null;

  const label = navigationLabel ?? "Saving changes";

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
      data-testid="global-loading-indicator"
      role="status"
    >
      <div aria-hidden="true" className="h-1 overflow-hidden bg-[#081326]/10">
        <div className="loading-progress-bar h-full bg-[#d7aa54]" />
      </div>
      <div className="absolute right-4 top-3 flex items-center gap-2 rounded-full border border-[#081326]/10 bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#081326] shadow-lg shadow-[#081326]/10 backdrop-blur sm:right-6">
        <Loader2 aria-hidden="true" className="size-3.5 animate-spin text-[#8d672c]" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function showNavigationLoading(label?: string) {
  window.dispatchEvent(new CustomEvent(NAVIGATION_EVENT, { detail: { label } }));
}
