import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getCaptainTeam } from "@/lib/teams";
export default async function TeamAlias({params}:{params:Promise<{teamId:string}>}){const session=await requireRole("captain");const team=await getCaptainTeam(session.userId);if(team.id!==(await params).teamId)notFound();redirect("/dashboard/team");}
