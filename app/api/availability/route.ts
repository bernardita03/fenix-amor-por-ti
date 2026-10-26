import { expireOldHolds, services } from "../../lib/bookings";
import { getOccupiedSlots } from "../../lib/availability";

export async function GET(request: Request) {
  try {
    await expireOldHolds();
    const params = new URL(request.url).searchParams;
    const date = params.get("date")?.slice(0, 10) ?? "";
    const serviceId = params.get("serviceId")?.slice(0, 40) ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ occupied: [] });
    const selected = services.get(serviceId);
    if (!selected) return Response.json({ error: "Servicio inválido." }, { status: 400 });
    return Response.json({ occupied: await getOccupiedSlots(date, selected.duration) });
  } catch (error) {
    console.error("availability", error);
    return Response.json({ error: "No fue posible consultar los horarios." }, { status: 503 });
  }
}
