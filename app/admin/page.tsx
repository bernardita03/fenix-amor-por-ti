import Link from "next/link";
import { adminIsConfigured, currentAdminEmail } from "../lib/admin";
import AdminClient from "./admin-client";
import "./admin.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Panel privado | Fénix Amor por Ti", robots: { index: false, follow: false } };
export default async function AdminPage() {
  const email = await currentAdminEmail();
  if (!email) {
    return <main className="admin-gate"><img src="/assets/logo-fenix.webp" alt="Fénix Amor por Ti" /><h1>Panel privado</h1><p>{adminIsConfigured()
      ? "Ingresa con el correo autorizado mediante Cloudflare Access. Si ya iniciaste sesión, revisa que tu cuenta tenga permiso."
      : "El acceso administrativo aún no está configurado. La persona responsable debe habilitar Cloudflare Access antes de utilizar el panel."}</p><Link href="/">Volver al sitio</Link></main>;
  }
  return <AdminClient email={email} />;
}
