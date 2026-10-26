import { env } from "cloudflare:workers";

export type CalendarBooking = {
  id: string;
  service: string;
  duration: number;
  modality: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
};

export type CalendarBusyPeriod = {
  start: string;
  end: string;
  allDay?: boolean;
};

type CalendarResponse = {
  ok?: boolean;
  error?: string;
  busy?: CalendarBusyPeriod[];
};

function configuration() {
  const url = env.GOOGLE_CALENDAR_WEBHOOK_URL?.trim();
  const secret = env.GOOGLE_CALENDAR_SHARED_SECRET?.trim();
  return url && secret ? { url, secret } : null;
}

export function calendarIsConfigured() {
  return Boolean(configuration());
}

async function calendarRequest(payload: Record<string, unknown>): Promise<CalendarResponse> {
  const config = configuration();
  if (!config) return { ok: true };

  const response = await fetch(config.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, secret: config.secret }),
    redirect: "follow",
    signal: AbortSignal.timeout(10_000),
  });
  const data = await response.json().catch(() => ({})) as CalendarResponse;
  if (!response.ok || !data.ok) {
    throw new Error(data.error || `Google Calendar respondió con estado ${response.status}.`);
  }
  return data;
}

export async function getCalendarBusyPeriods(date: string) {
  if (!calendarIsConfigured()) return [];
  const result = await calendarRequest({ action: "availability", date });
  return Array.isArray(result.busy) ? result.busy : [];
}

export async function syncCalendarBooking(action: "upsert" | "delete", booking: CalendarBooking) {
  if (!calendarIsConfigured()) return false;
  await calendarRequest({ action, booking });
  return true;
}
