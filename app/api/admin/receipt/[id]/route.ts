import { bucket, database } from "../../../../lib/bookings";
import { requireAdminApi } from "../../../../lib/admin";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  try {
    const { id } = await context.params;
    const row = await database().prepare(
      "SELECT receipt_key AS receiptKey, receipt_type AS receiptType, receipt_name AS receiptName FROM bookings WHERE id = ?"
    ).bind(id).first<{ receiptKey: string | null; receiptType: string | null; receiptName: string | null }>();
    if (!row?.receiptKey) return new Response("Comprobante no encontrado.", { status: 404 });
    const object = await bucket().get(row.receiptKey);
    if (!object) return new Response("Comprobante no encontrado.", { status: 404 });
    return new Response(object.body, {
      headers: {
        "content-type": row.receiptType || "application/octet-stream",
        "content-disposition": `inline; filename="${(row.receiptName || "comprobante").replace(/[\"\r\n]/g, "")}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("admin receipt", error);
    return new Response("No fue posible abrir el comprobante.", { status: 503 });
  }
}
