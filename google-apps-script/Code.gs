const TIME_ZONE = "America/Santiago";

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function properties_() {
  return PropertiesService.getScriptProperties();
}

function calendar_() {
  const calendarId = properties_().getProperty("CALENDAR_ID");
  if (!calendarId || calendarId === "primary") return CalendarApp.getDefaultCalendar();
  const calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) throw new Error("No se encontró el calendario configurado.");
  return calendar;
}

function parseLocal_(date, time) {
  const parts = `${date}T${time}:00`.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):00$/);
  if (!parts) throw new Error("Fecha u hora inválida.");
  return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]), Number(parts[4]), Number(parts[5]), 0);
}

function eventForBooking_(calendar, booking) {
  const day = parseLocal_(booking.date, "00:00");
  const from = new Date(day.getTime() - 24 * 60 * 60 * 1000);
  const to = new Date(day.getTime() + 48 * 60 * 60 * 1000);
  return calendar.getEvents(from, to).find((event) => event.getTag("fenixBookingId") === booking.id) || null;
}

function description_(booking) {
  return [
    `Reserva: ${booking.id}`,
    `Cliente: ${booking.name}`,
    `Teléfono: ${booking.phone}`,
    `Correo: ${booking.email || "No informado"}`,
    `Servicio: ${booking.service}`,
    `Modalidad: ${booking.modality}`,
  ].join("\n");
}

function upsert_(booking) {
  const calendar = calendar_();
  const start = parseLocal_(booking.date, booking.time);
  const end = new Date(start.getTime() + Number(booking.duration) * 60 * 1000);
  const title = `${booking.service} · ${booking.name}`;
  const location = booking.modality === "En salón" ? "Fénix Amor por Ti, Puente Alto" : "Servicio a domicilio";
  let event = eventForBooking_(calendar, booking);

  if (event) {
    event.setTitle(title).setTime(start, end).setDescription(description_(booking)).setLocation(location);
  } else {
    event = calendar.createEvent(title, start, end, { description: description_(booking), location });
    event.setTag("fenixBookingId", booking.id);
  }
  event.removeAllReminders().addPopupReminder(120).addPopupReminder(24 * 60);
  return { eventId: event.getId() };
}

function remove_(booking) {
  const event = eventForBooking_(calendar_(), booking);
  if (event) event.deleteEvent();
  return { deleted: Boolean(event) };
}

function availability_(date) {
  const start = parseLocal_(date, "00:00");
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const busy = calendar_().getEvents(start, end).map((event) => ({
    start: Utilities.formatDate(event.getStartTime(), TIME_ZONE, "HH:mm"),
    end: Utilities.formatDate(event.getEndTime(), TIME_ZONE, "HH:mm"),
    allDay: event.isAllDayEvent(),
  }));
  return { busy };
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const expected = properties_().getProperty("SHARED_SECRET");
    if (!expected || payload.secret !== expected) return json_({ ok: false, error: "Acceso no autorizado." });

    let result;
    if (payload.action === "upsert" && payload.booking) result = upsert_(payload.booking);
    else if (payload.action === "delete" && payload.booking) result = remove_(payload.booking);
    else if (payload.action === "availability" && payload.date) result = availability_(payload.date);
    else throw new Error("Acción inválida.");

    return json_({ ok: true, ...result });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}
