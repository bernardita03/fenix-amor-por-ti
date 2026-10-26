import { cleanText, database, expireOldHolds, services } from "../../lib/bookings";
import { appointmentSlots, slotIsBusy } from "../../lib/availability";

const fixedHolidays = new Set(["01-01","05-01","05-21","06-21","06-29","07-16","08-15","09-18","09-19","10-12","10-31","11-01","12-08","12-25"]);
const datedHolidays = new Set(["2026-04-03","2026-04-04"]);

function dateIsClosed(date: string) {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  return day === 0 || fixedHolidays.has(date.slice(5)) || datedHolidays.has(date);
}

export async function POST(request: Request) {
  try {
    await expireOldHolds();
    const body = await request.json() as Record<string, unknown>;
    const serviceId = cleanText(body.serviceId, 40);
    const selected = services.get(serviceId);
    const modality = cleanText(body.modality, 40);
    const date = cleanText(body.date, 10);
    const dateLabel = cleanText(body.dateLabel, 100);
    const time = cleanText(body.time, 5);
    const name = cleanText(body.name, 100);
    const phone = cleanText(body.phone, 40);
    const email = cleanText(body.email, 160);
    if (!selected || !["En salón", "A domicilio"].includes(modality) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || !name || !phone) {
      return Response.json({ error: "Revisa los datos de la reserva." }, { status: 400 });
    }
    if (dateIsClosed(date)) return Response.json({ error: "Fénix no atiende los domingos ni los días festivos." }, { status: 400 });
    if (!appointmentSlots.includes(time) || new Date(`${date}T${time}:00-03:00`).getTime() <= Date.now()) {
      return Response.json({ error: "Selecciona una fecha y hora futuras." }, { status: 400 });
    }
    if (await slotIsBusy(date, time, selected.duration)) {
      return Response.json({ error: "Ese horario acaba de ser reservado. Selecciona otro." }, { status: 409 });
    }
    const now = Date.now();
    const id = `FENIX-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const holdUntil = now + 30 * 60 * 1000;
    await database().prepare(
      `INSERT INTO bookings (id, service_id, service, duration, deposit, modality, date, date_label, time, name, phone, email, status, hold_until, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
    ).bind(id, serviceId, selected.name, selected.duration, selected.deposit, modality, date, dateLabel, time, name, phone, email, holdUntil, now, now).run();
    return Response.json({ booking: { id, holdUntil, deposit: selected.deposit } }, { status: 201 });
  } catch (error) {
    console.error("create booking", error);
    return Response.json({ error: "No fue posible guardar la reserva." }, { status: 503 });
  }
}
