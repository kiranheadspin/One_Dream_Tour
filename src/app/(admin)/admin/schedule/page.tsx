import { SchedulePublisher } from "@/components/admin/schedule-publisher";
import { AdminHeading } from "@/components/admin/admin-heading";
import { listAdminScheduleData } from "@/lib/schedule";

export default async function AdminSchedulePage() {
  const schedule = await listAdminScheduleData();
  return (
    <div className="mx-auto max-w-7xl">
      <AdminHeading
        eyebrow="Tournament operations"
        title="Schedule publishing"
        description="Build fixtures privately, prevent team and venue overlaps, then publish verified details to the participating captains."
      />
      <div className="mt-7"><SchedulePublisher {...schedule} /></div>
    </div>
  );
}
