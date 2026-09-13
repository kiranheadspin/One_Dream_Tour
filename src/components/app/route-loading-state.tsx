import { OneDreamGroupLogo } from "@/components/brand/one-dream-group-logo";

type RouteLoadingStateProps = {
  surface: "root" | "public" | "captain" | "admin";
};

function LoadingBlock({ className }: { className: string }) {
  return <div aria-hidden="true" className={`loading-shimmer ${className}`} />;
}

function ScreenReaderStatus({ label }: { label: string }) {
  return <p className="sr-only" role="status">{label}</p>;
}

function PublicLoadingState() {
  return (
    <>
      <ScreenReaderStatus label="Loading page content" />
      <section aria-hidden="true" className="min-h-[690px] bg-[#081326] pt-20 text-white sm:min-h-[760px] sm:pt-32">
        <div className="container-shell flex min-h-[690px] items-center sm:min-h-[760px]">
          <div className="w-full max-w-[650px] py-8 sm:py-16">
            <LoadingBlock className="h-5 w-36 rounded-full bg-white/10" />
            <LoadingBlock className="mt-5 h-16 w-[min(100%,31rem)] rounded-md bg-[#d7aa54]/22 sm:h-20" />
            <LoadingBlock className="mt-4 h-7 w-56 rounded-md bg-white/12" />
            <LoadingBlock className="mt-8 h-5 w-[min(100%,27rem)] rounded-md bg-white/10" />
            <LoadingBlock className="mt-3 h-4 w-72 max-w-full rounded-md bg-white/10" />
            <div className="mt-8 grid grid-cols-2 gap-3">
              <LoadingBlock className="h-24 rounded-none bg-white/10" />
              <LoadingBlock className="h-24 rounded-none bg-white/10" />
            </div>
            <div className="mt-7 flex gap-3">
              <LoadingBlock className="h-12 w-44 rounded-md bg-[#d7aa54]/30" />
              <LoadingBlock className="h-12 w-40 rounded-md bg-white/10" />
            </div>
          </div>
        </div>
      </section>
      <section aria-hidden="true" className="bg-[#f7f3ea] py-20">
        <div className="container-shell grid gap-8 lg:grid-cols-2">
          <LoadingBlock className="h-12 max-w-md rounded-md bg-[#081326]/8" />
          <div className="grid grid-cols-3 gap-4"><LoadingBlock className="h-36 rounded-none bg-white" /><LoadingBlock className="h-36 rounded-none bg-white" /><LoadingBlock className="h-36 rounded-none bg-white" /></div>
        </div>
      </section>
    </>
  );
}

function AppLoadingState({ surface }: Pick<RouteLoadingStateProps, "surface">) {
  const isAdmin = surface === "admin";
  const workspaceLabel = isAdmin ? "Tournament CRM" : "Captain portal";

  return (
    <div className="min-h-screen bg-[#f5f2eb] md:grid md:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[268px_minmax(0,1fr)]">
      <ScreenReaderStatus label={`Loading ${isAdmin ? "tournament operations" : "captain workspace"}`} />
      <aside aria-hidden="true" className="hidden h-screen border-r border-white/8 bg-[#081326] text-white md:flex md:flex-col">
        <div className="mx-6 mt-6 w-[208px]"><OneDreamGroupLogo alt="" className="w-full" priority /></div>
        <div className="mt-7 px-7"><LoadingBlock className="h-3 w-28 rounded-full bg-[#d7aa54]/30" /><p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/45">{workspaceLabel}</p></div>
        <div className="mt-6 grid gap-2 px-4"><LoadingBlock className="h-11 rounded-lg bg-white/8" /><LoadingBlock className="h-11 rounded-lg bg-white/8" /><LoadingBlock className="h-11 rounded-lg bg-white/8" /><LoadingBlock className="h-11 rounded-lg bg-white/8" /></div>
        <div className="mt-auto border-t border-white/10 p-4"><LoadingBlock className="h-14 rounded-lg bg-white/8" /></div>
      </aside>
      <div className="min-w-0">
        <header aria-hidden="true" className="flex min-h-[72px] items-center justify-between border-b border-white/10 bg-[#081326] px-4 md:hidden"><LoadingBlock className="h-7 w-40 rounded-md bg-white/12" /><LoadingBlock className="size-10 rounded-full bg-white/12" /></header>
        <main aria-hidden="true" className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10 xl:py-10">
          <div className="mx-auto max-w-7xl">
            <LoadingBlock className="h-3 w-28 rounded-full bg-[#8d672c]/20" />
            <LoadingBlock className="mt-3 h-10 w-[min(100%,25rem)] rounded-md bg-[#081326]/10" />
            <LoadingBlock className="mt-3 h-4 w-[min(100%,34rem)] rounded-md bg-[#081326]/7" />
            {isAdmin ? <AdminContentSkeleton /> : <CaptainContentSkeleton />}
          </div>
        </main>
      </div>
    </div>
  );
}

function CaptainContentSkeleton() {
  return (
    <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,.55fr)]">
      <div className="grid gap-5"><LoadingBlock className="h-28 rounded-xl bg-white" /><LoadingBlock className="h-64 rounded-xl bg-white" /></div>
      <div className="grid content-start gap-5"><LoadingBlock className="h-60 rounded-xl bg-[#081326]/90" /><LoadingBlock className="h-44 rounded-xl bg-white" /></div>
    </div>
  );
}

function AdminContentSkeleton() {
  return (
    <>
      <div className="mt-7 grid grid-cols-2 overflow-hidden rounded-xl bg-[#081326] lg:grid-cols-4"><LoadingBlock className="h-32 rounded-none bg-white/8" /><LoadingBlock className="h-32 rounded-none bg-white/8" /><LoadingBlock className="h-32 rounded-none bg-white/8" /><LoadingBlock className="h-32 rounded-none bg-white/8" /></div>
      <LoadingBlock className="mt-6 h-32 rounded-xl bg-[#101f37]" />
      <LoadingBlock className="mt-8 h-72 rounded-xl bg-white" />
    </>
  );
}

function RootLoadingState() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#081326] px-6 text-center text-white">
      <ScreenReaderStatus label="Loading One Dream Cup" />
      <div aria-hidden="true" className="w-full max-w-xs">
        <OneDreamGroupLogo alt="" className="mx-auto w-56" priority />
        <LoadingBlock className="mt-10 h-1 w-full rounded-full bg-white/14" />
      </div>
    </div>
  );
}

export function RouteLoadingState({ surface }: RouteLoadingStateProps) {
  if (surface === "root") return <RootLoadingState />;
  if (surface === "public") return <PublicLoadingState />;
  return <AppLoadingState surface={surface} />;
}
