import { database, expireOldHolds } from "../../../lib/bookings";
import { requireAdminApi } from "../../../lib/admin";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  try {
    await expireOldHolds();
    const result = await database().prepare(
      `SELECT id, service, deposit, modality, date_label AS dateLabel, time, name, phone, email,
              status, receipt_key IS NOT NULL AS receiptReceived, created_at AS createdAt
       FROM bookings ORDER BY created_at DESC LIMIT 100`
    ).all();
    return Response.json({ bookings: result.results }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("admin list", error);
    return Response.json({ error: "No fue posible cargar las reservas." }, { status: 503 });
  }
}
