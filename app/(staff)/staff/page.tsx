import { DashboardAutoRefresh } from "@/components/staff/dashboard-auto-refresh";
import { Dashboard } from "@/components/staff/dashboard";
import { requireStaffPageActor } from "@/lib/staff/auth";
import { getStaffDashboard } from "@/lib/staff/queries";

export default async function StaffDashboardPage() {
  const actor = await requireStaffPageActor();
  const dashboard = await getStaffDashboard(actor);
  const renderedAt = new Date();

  return (
    <>
      <DashboardAutoRefresh refreshToken={renderedAt.toISOString()} />
      <Dashboard dashboard={dashboard} now={renderedAt} />
    </>
  );
}
