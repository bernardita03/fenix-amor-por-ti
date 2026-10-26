import { getCalendarBusyPeriods } from "./calendar";
import { database } from "./bookings";

export const appointmentSlots = Array.from({ length: 24 }, (_, index) => {
  const total = 9 * 60 + index * 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
});

type BusyInterval = { start: number; end: number };

function minutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

function overlaps(start: number, duration: number, interval: BusyInterval) {
  return start < interval.end && start + duration > interval.start;
}

export async function getBusyIntervals(date: string): Promise<BusyInterval[]> {
  const stored = await database().prepare(
    "SELECT time, duration FROM bookings WHERE date = ? AND status IN ('pending', 'confirmed')"
  ).bind(date).all<{ time: string; duration: number }>();

  const intervals: BusyInterval[] = stored.results.map((booking) => {
    const start = minutes(booking.time);
    return { start, end: start + Number(booking.duration) };
  });

  // Google Calendar complements the site's own booking records. If Google is
  // temporarily unavailable, keep the agenda usable and continue protecting
  // every pending or confirmed booking stored in D1.
  try {
    const external = await getCalendarBusyPeriods(date);
    for (const period of external) {
      if (period.allDay) {
        intervals.push({ start: 0, end: 24 * 60 });
        continue;
      }
      const start = minutes(period.start);
      let end = minutes(period.end);
      if (end <= start) end = 24 * 60;
      intervals.push({ start, end });
    }
  } catch (error) {
    console.error("calendar availability unavailable", error);
  }
  return intervals;
}

export async function getOccupiedSlots(date: string, duration: number) {
  const intervals = await getBusyIntervals(date);
  return appointmentSlots.filter((slot) => minutes(slot) + duration > 21 * 60 || intervals.some((interval) => overlaps(minutes(slot), duration, interval)));
}

export async function slotIsBusy(date: string, time: string, duration: number) {
  const intervals = await getBusyIntervals(date);
  const start = minutes(time);
  return start < 9 * 60 || start + duration > 21 * 60 || intervals.some((interval) => overlaps(start, duration, interval));
}
