import { env } from "cloudflare:workers";

type Service = { name: string; duration: number; deposit: number };
const service = (name: string, duration: number, price: number): Service => ({ name, duration, deposit: Math.min(5000, price) });

const baseServices: Array<[string, Service]> = [
  ["manicure-completa", service("Manicure completa sin esmalte",45,12000)],
  ["manicure-express-semi", service("Manicure express semi",30,12000)],
  ["manicure-semi", service("Manicure semipermanente",90,18000)],
  ["manicure-degrade-francesa", service("Manicure degradé o francesa",90,23000)],
  ["softgel", service("Extensión softgel",150,32000)],
  ["bano-gel-semi", service("Baño de gel con semi",90,28000)],
  ["manicure-varon", service("Manicure varón",90,20000)],
  ["retiro-extensiones", service("Retiro de extensiones",60,10000)],
  ["retiro-otro-lugar", service("Retiro de otro lugar",60,15000)],
  ["retiro-limpieza-rusa", service("Retiro con limpieza rusa",60,15000)],
  ["pedicure-completa", service("Pedicure completa sin esmalte",120,20000)],
  ["pedicure-semi", service("Pedicure semipermanente",120,24000)],
  ["pedicure-varon", service("Pedicure varón",150,26000)],
  ["pedispa-brillo", service("Pedispa brillo",120,25000)],
  ["pedispa-semi", service("Pedispa semipermanente",150,28000)],
  ["pedispa-varon", service("Pedispa varón",150,28000)],
];

const waxZones: Array<[string,string,number,number|null,number|null]> = [
  ["medio-brazo","Medio brazo",30,5500,8000],["media-espalda","Media espalda",45,6000,9000],["media-pierna","Media pierna",60,6000,8000],
  ["abdomen","Abdomen",45,5000,9000],["axilas","Axilas",30,5000,6000],["barba","Barba",30,null,7000],["bozo","Bozo",30,5000,4000],
  ["brazos-completos","Brazos completos",60,9000,10000],["cejas","Cejas",30,5000,6000],["cola","Cola",30,4000,6000],["cuello","Cuello",30,5000,6000],
  ["espalda-completa","Espalda completa",60,8000,12000],["frente","Frente",30,5000,6000],["gluteos","Glúteos",45,5000,8000],["hombros","Hombros",30,3000,4500],
  ["manos-dedos","Manos y dedos",30,4000,5000],["menton","Mentón",30,3000,4000],["muslos","Muslos",45,7000,8000],["nariz","Nariz",30,3000,4000],
  ["nuca","Nuca",30,6000,6500],["orejas","Orejas",30,4000,6000],["parche","Parche",30,2000,2500],["patillas","Patillas",30,5000,6000],
  ["pecho-dorso","Pecho o dorso completo",60,null,12000],["pecho-abdomen","Pecho y abdomen",60,12000,null],["pezones","Pezones",30,3000,5000],
  ["piernas-completas","Piernas completas",90,15000,16000],["pomulos","Pómulos",30,4000,6000],["rebaje-completo","Rebaje completo",90,16000,20000],
  ["rebaje-corto","Rebaje corto",45,8000,10000],["rebaje-largo","Rebaje largo",60,12000,14000],["rebaje-brasileno","Rebaje semicompleto brasileño",90,16000,16000],
  ["rodilla","Rodilla",30,4000,5000],["rostro-completo","Rostro completo",60,15000,18000],
];

const waxServices: Array<[string, Service]> = waxZones.flatMap(([id,name,duration,dama,varon]) => {
  const entries: Array<[string, Service]> = [];
  if (dama !== null) entries.push([`dep-dama-${id}`, service(`${name} · Dama`,duration,dama)]);
  if (varon !== null) entries.push([`dep-varon-${id}`, service(`${name} · Varón`,duration,varon)]);
  return entries;
});

export const services = new Map<string, Service>([...baseServices,...waxServices]);

export function database() {
  if (!env.DB) throw new Error("La base de datos no está disponible.");
  return env.DB;
}

export function bucket() {
  if (!env.BUCKET) throw new Error("El almacenamiento de comprobantes no está disponible.");
  return env.BUCKET;
}

export async function expireOldHolds() {
  const now = Date.now();
  await database().prepare(
    "UPDATE bookings SET status = 'expired', updated_at = ? WHERE status = 'pending' AND receipt_key IS NULL AND hold_until < ?"
  ).bind(now, now).run();
}

export function cleanText(value: unknown, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
