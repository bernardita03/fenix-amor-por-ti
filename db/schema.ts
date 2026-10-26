import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  serviceId: text("service_id").notNull(),
  service: text("service").notNull(),
  duration: integer("duration").notNull(),
  deposit: integer("deposit").notNull(),
  modality: text("modality").notNull(),
  date: text("date").notNull(),
  dateLabel: text("date_label").notNull(),
  time: text("time").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().default(""),
  status: text("status").notNull().default("pending"),
  receiptKey: text("receipt_key"),
  receiptName: text("receipt_name"),
  receiptType: text("receipt_type"),
  holdUntil: integer("hold_until").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  index("idx_bookings_date_time").on(table.date, table.time),
  index("idx_bookings_status_created").on(table.status, table.createdAt),
]);
