import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { FixtureSaveError, removeFixture, saveFixture } from "@/lib/schedule";
import { fixtureSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = fixtureSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Enter valid fixture details." }, { status: 422 });

  try {
    const fixture = await saveFixture(parsed.data, (await params).id, session.userId);
    revalidatePath("/admin/schedule");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/announcements");
    return NextResponse.json({ fixture });
  } catch (error) {
    if (error instanceof FixtureSaveError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error("Fixture update failed", error);
    return NextResponse.json({ error: "Fixture could not be saved." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await removeFixture((await params).id, session.userId);
    revalidatePath("/admin/schedule");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/announcements");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof FixtureSaveError) return NextResponse.json({ error: error.message }, { status: error.message === "Fixture not found." ? 404 : 409 });
    console.error("Fixture delete failed", error);
    return NextResponse.json({ error: "Fixture could not be deleted." }, { status: 500 });
  }
}
