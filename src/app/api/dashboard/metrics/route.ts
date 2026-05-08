import { getAuthenticatedUser } from "@/lib/auth";
import { jsonNoStore, logControlledError, unauthorizedResponse } from "@/lib/api-security";
import { buildDashboardMetrics } from "@/lib/dashboard-metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const metrics = await buildDashboardMetrics();
    return jsonNoStore({ metrics });
  } catch (error) {
    logControlledError("dashboard_metrics", error);
    return jsonNoStore({ error: "Não foi possível carregar as métricas do painel." }, 500);
  }
}
