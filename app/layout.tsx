import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fénix Amor por Ti | Karina Pérez",
  description: "Belleza profesional, manicure, pestañas, cejas y cuidado facial en Puente Alto.",
  icons: { icon: "/assets/logo-fenix.webp" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
