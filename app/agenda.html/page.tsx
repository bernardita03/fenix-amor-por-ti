import Script from "next/script";
import source from "../../legacy/agenda.html?raw";

const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";

export const metadata = {
  title: "Reservar una hora | Fénix Amor por Ti",
  description: "Consulta servicios, valores y horarios disponibles. Reserva tu hora y envía el comprobante de tu abono de forma segura.",
};

export default function Agenda() {
  return (
    <>
      <link rel="stylesheet" href="/agenda.css" />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <Script src="/agenda.js" strategy="afterInteractive" />
    </>
  );
}
