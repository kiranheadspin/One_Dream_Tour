import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { FixtureSaveError, removeVenue, saveVenue } from "@/lib/schedule";
import { venueSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = venueSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Enter valid venue details." }, { status: 422 });

  try {
    const venue = await saveVenue(parsed.data, (await params).id, session.userId);
    revalidatePath("/admin/schedule");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/announcements");
    return NextResponse.json({ venue });
  } catch (error) {
    if (error instanceof FixtureSaveError) return NextResponse.json({ error: error.message }, { status: error.message === "Venue not found." ? 404 : 409 });
    console.error("Venue update failed", error);
    return NextResponse.json({ error: "Venue could not be saved." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await removeVenue((await params).id, session.userId);
    revalidatePath("/admin/schedule");
    revalidatePath("/");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof FixtureSaveError) return NextResponse.json({ error: error.message }, { status: error.message === "Venue not found." ? 404 : 409 });
    console.error("Venue delete failed", error);
    return NextResponse.json({ error: "Venue could not be deleted." }, { status: 500 });
  }
}
