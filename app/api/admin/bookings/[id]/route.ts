import { database } from "../../../../lib/bookings";
import { requireAdminApi } from "../../../../lib/admin";
import { calendarIsConfigured, syncCalendarBooking, type CalendarBooking } from "../../../../lib/calendar";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  try {
    const { id } = await context.params;
    const body = await request.json() as { status?: string };
    if (!body.status || !["confirmed", "rejected"].includes(body.status)) {
      return Response.json({ error: "Estado inválido." }, { status: 400 });
    }
    const booking = await database().prepare(
      `SELECT id, service, duration, modality, date, time, name, phone, email, status
       FROM bookings WHERE id = ?`
    ).bind(id).first<CalendarBooking & { status: string }>();
    if (!booking) return Response.json({ error: "Reserva no encontrada." }, { status: 404 });

    let calendarSynced = false;
    if (body.status === "confirmed") {
      calendarSynced = await syncCalendarBooking("upsert", booking);
    } else if (booking.status === "confirmed") {
      calendarSynced = await syncCalendarBooking("delete", booking);
    }

    const result = await database().prepare(
      "UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?"
    ).bind(body.status, Date.now(), id).run();
    if (!result.meta.changes) return Response.json({ error: "Reserva no encontrada." }, { status: 404 });
    return Response.json({ ok: true, calendarSynced, calendarConfigured: calendarIsConfigured() });
  } catch (error) {
    console.error("admin update", error);
    return Response.json({ error: "No fue posible sincronizar la reserva. No se realizó el cambio; intenta nuevamente." }, { status: 503 });
  }
}
