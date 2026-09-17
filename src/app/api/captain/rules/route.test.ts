import { beforeEach, describe, expect, it, vi } from "vitest";
import { RULES_VERSION } from "@/lib/tournament-rules";

const mocks = vi.hoisted(() => ({ session: vi.fn(), accept: vi.fn(), demo: { isDemoMode: true }, query: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getSession: mocks.session }));
vi.mock("@/lib/env", () => mocks.demo);
vi.mock("@/lib/demo-store", () => ({ acceptDemoRules: mocks.accept }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.query }));
import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/captain/rules", { method: "POST", body: JSON.stringify(body) });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.demo.isDemoMode = true;
  mocks.session.mockResolvedValue({ role: "captain", userId: "captain-1" });
  mocks.accept.mockResolvedValue({ rulesVersion: RULES_VERSION });
});

describe("rules acceptance API", () => {
  it.each([null, { role: "admin" }])("requires a captain session", async (session) => {
    mocks.session.mockResolvedValue(session);
    expect((await POST(request({ version: RULES_VERSION, accepted: true }))).status).toBe(401);
    expect(mocks.accept).not.toHaveBeenCalled();
  });
  it.each([null, {}, { version: "2026-draft", accepted: true }, { version: RULES_VERSION, accepted: false }])("rejects absent, stale or unaccepted terms", async (body) => {
    expect((await POST(request(body))).status).toBe(409);
    expect(mocks.accept).not.toHaveBeenCalled();
    expect(mocks.query).not.toHaveBeenCalled();
  });
  it("records the displayed version in demo mode", async () => {
    expect((await POST(request({ version: RULES_VERSION, accepted: true }))).status).toBe(200);
    expect(mocks.accept).toHaveBeenCalledOnce();
  });
  it("does not rewrite a current production acceptance timestamp", async () => {
    mocks.demo.isDemoMode = false;
    const chain = { select: vi.fn(), eq: vi.fn(), is: vi.fn(), single: vi.fn(), update: vi.fn() };
    chain.select.mockReturnValue(chain); chain.eq.mockReturnValue(chain); chain.is.mockReturnValue(chain);
    chain.single.mockResolvedValue({ data: { id: "team-1", rules_version: RULES_VERSION, rules_accepted_at: "2026-09-14T00:00:00Z" }, error: null });
    mocks.query.mockResolvedValue({ from: () => chain });
    expect((await POST(request({ version: RULES_VERSION, accepted: true }))).status).toBe(200);
    expect(chain.update).not.toHaveBeenCalled();
  });
  it("updates only the owned, active team and compares its previous acceptance", async () => {
    mocks.demo.isDemoMode = false;
    const chain = { select: vi.fn(), eq: vi.fn(), is: vi.fn(), single: vi.fn(), update: vi.fn(), maybeSingle: vi.fn() };
    for (const method of [chain.select, chain.eq, chain.is, chain.update]) method.mockReturnValue(chain);
    chain.single.mockResolvedValue({ data: { id: "team-1", rules_version: "2026-draft", rules_accepted_at: "2026-09-13T00:00:00Z" }, error: null });
    chain.maybeSingle.mockResolvedValue({ data: { id: "team-1" }, error: null });
    mocks.query.mockResolvedValue({ from: () => chain });
    expect((await POST(request({ version: RULES_VERSION, accepted: true }))).status).toBe(200);
    expect(chain.eq).toHaveBeenCalledWith("id", "team-1");
    expect(chain.eq).toHaveBeenCalledWith("captain_profile_id", "captain-1");
    expect(chain.is).toHaveBeenCalledWith("deleted_at", null);
    expect(chain.eq).toHaveBeenCalledWith("rules_version", "2026-draft");
    expect(chain.eq).toHaveBeenCalledWith("rules_accepted_at", "2026-09-13T00:00:00Z");
    expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({ rules_version: RULES_VERSION }));
  });
});
