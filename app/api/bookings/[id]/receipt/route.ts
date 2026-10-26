import { bucket, database } from "../../../../lib/bookings";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const booking = await database().prepare(
      "SELECT id, service, date_label, time, name, phone, deposit, status, hold_until FROM bookings WHERE id = ?"
    ).bind(id).first<Record<string, string | number>>();
    if (!booking || booking.status !== "pending") return Response.json({ error: "La reserva no está disponible." }, { status: 404 });
    if (Number(booking.hold_until) < Date.now()) return Response.json({ error: "El tiempo de reserva terminó. Selecciona nuevamente el horario." }, { status: 410 });
    const form = await request.formData();
    const receipt = form.get("receipt");
    if (!(receipt instanceof File) || receipt.size === 0 || receipt.size > 8 * 1024 * 1024 || !allowedTypes.has(receipt.type)) {
      return Response.json({ error: "Adjunta una imagen o PDF de hasta 8 MB." }, { status: 400 });
    }
    const extension = receipt.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").slice(0, 8) || "bin";
    const key = `receipts/${id}.${extension}`;
    await bucket().put(key, await receipt.arrayBuffer(), { httpMetadata: { contentType: receipt.type } });
    const now = Date.now();
    await database().prepare(
      "UPDATE bookings SET receipt_key = ?, receipt_name = ?, receipt_type = ?, updated_at = ? WHERE id = ?"
    ).bind(key, receipt.name.slice(0, 180), receipt.type, now, id).run();

    return Response.json({ ok: true });
  } catch (error) {
    console.error("receipt upload", error);
    return Response.json({ error: "No fue posible guardar el comprobante." }, { status: 503 });
  }
}
