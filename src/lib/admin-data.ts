import "server-only";
import { isDemoMode } from "@/lib/env";
import { readDemoDatabase } from "@/lib/demo-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminTeamView { id:string; name:string; memberName?:string; company:string; city:string; registrationStatus:string; captainName:string; playerCount:number; paymentStatus:string; enquiryReference:string; }
export interface AdminTeamDetail extends AdminTeamView {
  rulesAcceptedAt?: string;
  rulesVersion?: string;
  updatedAt: string;
  players: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    employeeId: string;
    epfoNumber: string;
    isCaptain: boolean;
  }>;
}
export interface AdminPaymentView {
  id: string;
  orderId: string;
  providerPaymentId?: string;
  amountPaise: number;
  status: string;
  provider: string;
  teamName: string;
  company: string;
  captainName: string;
  submittedAt?: string;
  updatedAt: string;
}

export async function listAdminTeams():Promise<AdminTeamView[]> {
  if(isDemoMode)return (await readDemoDatabase()).teams.map(team=>({id:team.id,name:team.officialName ?? `${team.company} XI`,memberName:team.officialName ? team.name : undefined,company:team.company,city:team.city,registrationStatus:team.registrationStatus,captainName:team.captainName,playerCount:team.players.length,paymentStatus:team.paymentStatus,enquiryReference:team.enquiryReference??"Not linked"}));
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.from("teams").select("id,name,member_name,registration_status,companies!inner(legal_name),tournament_cities!inner(city),profiles!teams_captain_profile_id_fkey(full_name),team_members(id),registrations(leads(reference),payments(status))").is("deleted_at",null).order("created_at",{ascending:false});
  if(error)throw error;
  return data.map((row)=>{const company=Array.isArray(row.companies)?row.companies[0]:row.companies;const city=Array.isArray(row.tournament_cities)?row.tournament_cities[0]:row.tournament_cities;const captain=Array.isArray(row.profiles)?row.profiles[0]:row.profiles;const registration=Array.isArray(row.registrations)?row.registrations[0]:row.registrations;const lead=Array.isArray(registration?.leads)?registration.leads[0]:registration?.leads;const payments=registration?.payments??[];return{id:row.id,name:row.name,memberName:row.member_name??undefined,company:company?.legal_name??"",city:city?.city??"",registrationStatus:row.registration_status,captainName:captain?.full_name??"",playerCount:row.team_members?.length??0,paymentStatus:payments.some((payment)=>payment.status==="paid")?"Paid":"Pending",enquiryReference:lead?.reference??"Not linked"};});
}

export async function getAdminTeam(teamId: string): Promise<AdminTeamDetail | null> {
  if (isDemoMode) {
    const team = (await readDemoDatabase()).teams.find((item) => item.id === teamId);
    if (!team) return null;
    return {
      id: team.id,
      name: team.officialName ?? `${team.company} XI`,
      memberName: team.officialName ? team.name : undefined,
      company: team.company,
      city: team.city,
      registrationStatus: team.registrationStatus,
      captainName: team.captainName,
      playerCount: team.players.length,
      paymentStatus: team.paymentStatus,
      enquiryReference: team.enquiryReference ?? "Not linked",
      rulesAcceptedAt: team.rulesAcceptedAt,
      rulesVersion: team.rulesVersion,
      updatedAt: team.updatedAt,
      players: team.players.map((player) => ({
        id: player.id,
        name: player.name,
        email: player.email,
        phone: player.phone,
        employeeId: player.employeeId,
        epfoNumber: player.epfoNumber ?? "",
        isCaptain: player.isCaptain,
      })),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id,name,member_name,registration_status,rules_accepted_at,rules_version,updated_at,companies!inner(legal_name),tournament_cities!inner(city),profiles!teams_captain_profile_id_fkey(full_name),team_members(id,full_name,email,phone,employee_id,epfo_number,is_captain),registrations(leads(reference),payments(status))")
    .eq("id", teamId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const company = Array.isArray(data.companies) ? data.companies[0] : data.companies;
  const city = Array.isArray(data.tournament_cities) ? data.tournament_cities[0] : data.tournament_cities;
  const captain = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  const registration = Array.isArray(data.registrations) ? data.registrations[0] : data.registrations;
  const lead = Array.isArray(registration?.leads) ? registration.leads[0] : registration?.leads;
  const payments = registration?.payments ?? [];

  return {
    id: data.id,
    name: data.name,
    memberName: data.member_name ?? undefined,
    company: company?.legal_name ?? "",
    city: city?.city ?? "",
    registrationStatus: data.registration_status,
    captainName: captain?.full_name ?? "",
    playerCount: data.team_members?.length ?? 0,
    paymentStatus: payments.some((payment) => payment.status === "paid") ? "Paid" : "Pending",
    enquiryReference: lead?.reference ?? "Not linked",
    rulesAcceptedAt: data.rules_accepted_at ?? undefined,
    rulesVersion: data.rules_version ?? undefined,
    updatedAt: data.updated_at,
    players: (data.team_members ?? []).map((member) => ({
      id: member.id,
      name: member.full_name,
      email: member.email,
      phone: member.phone,
      employeeId: member.employee_id,
      epfoNumber: member.epfo_number ?? "",
      isCaptain: member.is_captain,
    })),
  };
}

export async function listAdminPayments():Promise<AdminPaymentView[]> {
  if(isDemoMode){
    const database=await readDemoDatabase();
    const teamsById=new Map(database.teams.map(team=>[team.id,team]));
    return database.payments.map(payment=>{
      const team=teamsById.get(payment.teamId);
      return {
        id:payment.id,
        orderId:payment.orderId,
        providerPaymentId:payment.providerPaymentId,
        amountPaise:payment.amountPaise,
        status:payment.status,
        provider:payment.provider??"razorpay",
        teamName:team?.name??"Unknown team",
        company:team?.company??"",
        captainName:team?.captainName??"",
        submittedAt:payment.submittedAt,
        updatedAt:payment.updatedAt,
      };
    });
  }
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.from("payments").select("id,provider,provider_order_id,provider_payment_id,amount_paise,status,submitted_at,updated_at,registrations!inner(teams!inner(name,companies!inner(legal_name),profiles!teams_captain_profile_id_fkey(full_name)))").order("created_at",{ascending:false}).limit(200);
  if(error)throw error;
  return data.map(payment=>{
    const registration=Array.isArray(payment.registrations)?payment.registrations[0]:payment.registrations;
    const teamRows=registration?.teams;
    const team=Array.isArray(teamRows)?teamRows[0]:teamRows;
    const companyRows=team?.companies;
    const company=Array.isArray(companyRows)?companyRows[0]:companyRows;
    const captainRows=team?.profiles;
    const captain=Array.isArray(captainRows)?captainRows[0]:captainRows;
    return {
      id:payment.id,
      orderId:payment.provider_order_id,
      providerPaymentId:payment.provider_payment_id??undefined,
      amountPaise:payment.amount_paise,
      status:payment.status,
      provider:payment.provider,
      teamName:team?.name??"Unknown team",
      company:company?.legal_name??"",
      captainName:captain?.full_name??"",
      submittedAt:payment.submitted_at??undefined,
      updatedAt:payment.updated_at,
    };
  });
}
