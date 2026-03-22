import { pgTable, serial, text, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  hospital: text("hospital").notNull(),
  city: text("city").notNull(),
  qualification: text("qualification").notNull(),
  experience: integer("experience").notNull(),
  rating: real("rating").notNull().default(4.5),
  consultationFee: integer("consultation_fee").notNull().default(500),
  phone: text("phone").notNull(),
});

export const insertDoctorSchema = createInsertSchema(doctorsTable).omit({ id: true });
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctorsTable.$inferSelect;
