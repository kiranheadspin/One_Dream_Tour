import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { FixtureSaveError, saveFixture } from "@/lib/schedule";
import { fixtureSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = fixtureSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Enter valid fixture details." }, { status: 422 });

  try {
    const fixture = await saveFixture(parsed.data, undefined, session.userId);
    revalidatePath("/admin/schedule");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/announcements");
    return NextResponse.json({ fixture }, { status: 201 });
  } catch (error) {
    if (error instanceof FixtureSaveError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error("Fixture create failed", error);
    return NextResponse.json({ error: "Fixture could not be saved." }, { status: 500 });
  }
}
