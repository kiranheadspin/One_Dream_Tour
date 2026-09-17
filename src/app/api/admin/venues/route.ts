import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { FixtureSaveError, saveVenue } from "@/lib/schedule";
import { venueSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = venueSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Enter valid venue details." }, { status: 422 });

  try {
    const venue = await saveVenue(parsed.data, undefined, session.userId);
    revalidatePath("/admin/schedule");
    revalidatePath("/");
    return NextResponse.json({ venue }, { status: 201 });
  } catch (error) {
    if (error instanceof FixtureSaveError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error("Venue create failed", error);
    return NextResponse.json({ error: "Venue could not be saved." }, { status: 500 });
  }
}
