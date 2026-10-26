"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "./admin.css";

type Booking = {
  id: string; service: string; deposit: number; modality: string; dateLabel: string;
  time: string; name: string; phone: string; email: string; status: string;
  receiptReceived: number; createdAt: number;
};

const money = (value: number) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);

export default function AdminClient({ email }: { email: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/admin/bookings", { cache: "no-store" });
      const data = await response.json() as { error?: string; bookings?: Booking[] };
      if (!response.ok) throw new Error(data.error || "No fue posible cargar las reservas.");
      setBookings(data.bookings ?? []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Ocurrió un error."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const stats = useMemo(() => ({
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  }), [bookings]);

  async function update(id: string, status: "confirmed" | "rejected") {
    setMessage("");
    const response = await fetch(`/api/admin/bookings/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await response.json() as { error?: string; calendarSynced?: boolean; calendarConfigured?: boolean };
    if (!response.ok) { setMessage(data.error || "No fue posible actualizar la reserva."); return; }
    await load();
    if (status === "confirmed") {
      setMessage(data.calendarSynced ? "Reserva confirmada y agregada a Google Calendar." : "Reserva confirmada. Google Calendar aún no está configurado.");
    } else {
      setMessage(data.calendarSynced ? "Reserva rechazada y eliminada de Google Calendar." : "Reserva rechazada.");
    }
  }

  async function resendNotification(booking: Booking) {
    setMessage("Solicitando el reenvío del correo…");
    setNotifyingId(booking.id);
    try {
      const response = await fetch("https://formsubmit.co/ajax/bernardita.leiva.m@gmail.com", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          _subject: `Nueva reserva ${booking.id} con comprobante`,
          _url: window.location.href,
          Reserva: booking.id,
          Cliente: booking.name,
          Servicio: booking.service,
          Fecha: `${booking.dateLabel} a las ${booking.time}`,
          WhatsApp: booking.phone,
          Abono: money(booking.deposit),
          "Revisar de forma segura": window.location.href,
          _template: "table",
          _captcha: "false",
        }),
      });
      const data = await response.json().catch(() => ({})) as { success?: boolean | string; message?: string };
      if (!response.ok || !data.success) throw new Error(data.message || "El proveedor no aceptó el correo.");
      setMessage("El proveedor aceptó el reenvío. Revisa Recibidos, Spam y Promociones; si es la primera vez, confirma el mensaje de activación.");
    } catch (error) {
      setMessage(error instanceof Error ? `No se pudo reenviar: ${error.message}` : "No se pudo reenviar el aviso.");
    } finally {
      setNotifyingId(null);
    }
  }

  return <main className="admin-shell">
    <header className="admin-header"><Link href="/"><img src="/assets/logo-fenix.webp" alt="" /><span><strong>Karina Pérez</strong><small>Fénix Amor por Ti</small></span></Link><div><small>Sesión protegida</small><b>{email}</b><a href="/cdn-cgi/access/logout">Cerrar sesión</a></div></header>
    <section className="admin-title"><div><p>Administración de agenda</p><h1>Reservas y comprobantes</h1><span>Solo las cuentas autorizadas pueden ver esta información.</span></div><button onClick={() => void load()}>Actualizar</button></section>
    <section className="admin-stats"><article><span>Pendientes</span><strong>{stats.pending}</strong></article><article><span>Confirmadas</span><strong>{stats.confirmed}</strong></article><article><span>Rechazadas</span><strong>{stats.rejected}</strong></article></section>
    {message && <p className="admin-message">{message}</p>}
    <section className="booking-list">
      {loading ? <p className="admin-empty">Cargando reservas…</p> : !bookings.length ? <p className="admin-empty">Aún no hay reservas.</p> : bookings.map((booking) => <article className="booking-row" key={booking.id}>
        <div className="booking-main"><p><span className={`status ${booking.status}`}>{booking.status === "confirmed" ? "Confirmada" : booking.status === "rejected" ? "Rechazada" : booking.status === "expired" ? "Expirada" : "Pendiente"}</span><small>{booking.id}</small></p><h2>{booking.name}</h2><h3>{booking.service}</h3></div>
        <dl><div><dt>Fecha</dt><dd>{booking.dateLabel}<br />{booking.time}</dd></div><div><dt>Modalidad</dt><dd>{booking.modality}</dd></div><div><dt>Contacto</dt><dd>{booking.phone}<br />{booking.email || "Sin correo"}</dd></div><div><dt>Abono</dt><dd>{money(booking.deposit)}</dd></div></dl>
        <div className="booking-actions">{booking.receiptReceived ? <><a href={`/api/admin/receipt/${booking.id}`} target="_blank" rel="noreferrer">Ver comprobante</a><button className="notify" onClick={() => void resendNotification(booking)} disabled={notifyingId === booking.id}>{notifyingId === booking.id ? "Enviando…" : "Reenviar aviso"}</button></> : <span>Sin comprobante</span>}<button onClick={() => void update(booking.id, "confirmed")} disabled={booking.status === "confirmed"}>Confirmar</button><button className="reject" onClick={() => void update(booking.id, "rejected")} disabled={booking.status === "rejected"}>Rechazar</button></div>
      </article>)}
    </section>
  </main>;
}
