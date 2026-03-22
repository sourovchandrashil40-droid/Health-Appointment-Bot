import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { doctorsTable, appointmentsTable } from "@workspace/db";
import { CreateAppointmentBody } from "@workspace/api-zod";
import { eq, and, ilike } from "drizzle-orm";

const router: IRouter = Router();

// Generate time slots for the next 7 days
function generateTimeSlots(doctorId: number) {
  const slots = [];
  const times = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
  let id = doctorId * 1000;

  for (let day = 1; day <= 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    // Skip Fridays (day = 5 in JS where 0 = Sunday)
    if (date.getDay() === 5) continue;

    const dateStr = date.toISOString().split("T")[0];
    for (const time of times) {
      id++;
      slots.push({
        id,
        doctorId,
        date: dateStr,
        time,
        available: Math.random() > 0.3, // 70% chance of availability
      });
    }
  }
  return slots;
}

// List doctors with optional city/specialty filters
router.get("/doctors", async (req, res) => {
  const { city, specialty } = req.query as { city?: string; specialty?: string };

  let query = db.select().from(doctorsTable);

  if (city && specialty) {
    const results = await db.select().from(doctorsTable).where(
      and(
        ilike(doctorsTable.city, `%${city}%`),
        ilike(doctorsTable.specialty, `%${specialty}%`)
      )
    );
    res.json(results);
    return;
  } else if (city) {
    const results = await db.select().from(doctorsTable).where(
      ilike(doctorsTable.city, `%${city}%`)
    );
    res.json(results);
    return;
  } else if (specialty) {
    const results = await db.select().from(doctorsTable).where(
      ilike(doctorsTable.specialty, `%${specialty}%`)
    );
    res.json(results);
    return;
  }

  const results = await query;
  res.json(results);
});

// Get doctor availability
router.get("/doctors/:id/availability", async (req, res) => {
  const id = parseInt(req.params.id);
  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, id));

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  const slots = generateTimeSlots(id);
  res.json(slots);
});

// List appointments
router.get("/appointments", async (req, res) => {
  const appointments = await db.select().from(appointmentsTable).orderBy(appointmentsTable.createdAt);
  res.json(appointments);
});

// Create appointment
router.post("/appointments", async (req, res) => {
  const body = CreateAppointmentBody.parse(req.body);

  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, body.doctorId));

  if (!doctor) {
    res.status(400).json({ error: "Doctor not found" });
    return;
  }

  const [appointment] = await db
    .insert(appointmentsTable)
    .values({
      doctorId: body.doctorId,
      patientName: body.patientName,
      patientPhone: body.patientPhone,
      date: body.date,
      time: body.time,
      city: doctor.city,
      specialty: doctor.specialty,
      status: "confirmed",
      doctorName: doctor.name,
      hospitalName: doctor.hospital,
    })
    .returning();

  res.status(201).json(appointment);
});

export default router;
