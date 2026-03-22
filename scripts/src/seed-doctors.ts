import { db } from "@workspace/db";
import { doctorsTable } from "@workspace/db";

const doctors = [
  // Dhaka
  { name: "Dr. Rahim Uddin Ahmed", specialty: "Gastroenterologist", hospital: "Dhaka Medical College Hospital", city: "Dhaka", qualification: "MBBS, MD (Gastroenterology)", experience: 18, rating: 4.8, consultationFee: 1500, phone: "01711-234567" },
  { name: "Dr. Farida Begum", specialty: "Cardiologist", hospital: "National Heart Foundation Hospital", city: "Dhaka", qualification: "MBBS, MD (Cardiology), FRCP", experience: 22, rating: 4.9, consultationFee: 2000, phone: "01712-345678" },
  { name: "Dr. Kamal Hossain", specialty: "Neurologist", hospital: "Bangabandhu Sheikh Mujib Medical University", city: "Dhaka", qualification: "MBBS, MD (Neurology)", experience: 15, rating: 4.7, consultationFee: 1800, phone: "01713-456789" },
  { name: "Dr. Nasreen Akhter", specialty: "Gynecologist", hospital: "Dhaka Shishu Hospital", city: "Dhaka", qualification: "MBBS, FCPS (Gynecology)", experience: 20, rating: 4.8, consultationFee: 1200, phone: "01714-567890" },
  { name: "Dr. Mahbubur Rahman", specialty: "Orthopedic", hospital: "National Institute of Traumatology", city: "Dhaka", qualification: "MBBS, MS (Orthopedics)", experience: 16, rating: 4.6, consultationFee: 1500, phone: "01715-678901" },
  { name: "Dr. Sultana Parvin", specialty: "Dermatologist", hospital: "Dhaka Skin Center", city: "Dhaka", qualification: "MBBS, DDV", experience: 12, rating: 4.7, consultationFee: 1000, phone: "01716-789012" },
  { name: "Dr. Aminul Islam", specialty: "Pediatrician", hospital: "Dhaka Shishu Hospital", city: "Dhaka", qualification: "MBBS, DCH, FCPS (Pediatrics)", experience: 14, rating: 4.9, consultationFee: 1000, phone: "01717-890123" },
  { name: "Dr. Lutfar Rahman", specialty: "Endocrinologist", hospital: "BIRDEM General Hospital", city: "Dhaka", qualification: "MBBS, MD (Endocrinology)", experience: 19, rating: 4.8, consultationFee: 2000, phone: "01718-901234" },
  { name: "Dr. Razia Sultana", specialty: "Ophthalmologist", hospital: "Ispahani Islamia Eye Institute", city: "Dhaka", qualification: "MBBS, DO, FCPS (Ophthalmology)", experience: 13, rating: 4.7, consultationFee: 1200, phone: "01719-012345" },
  { name: "Dr. Shafiqul Islam", specialty: "General Physician", hospital: "Square Hospital", city: "Dhaka", qualification: "MBBS, FCPS (Medicine)", experience: 10, rating: 4.6, consultationFee: 800, phone: "01720-123456" },
  { name: "Dr. Tahmina Khanam", specialty: "Psychiatrist", hospital: "National Institute of Mental Health", city: "Dhaka", qualification: "MBBS, MD (Psychiatry)", experience: 11, rating: 4.5, consultationFee: 1500, phone: "01721-234567" },
  { name: "Dr. Zahir Uddin", specialty: "Pulmonologist", hospital: "National Institute of Diseases of Chest", city: "Dhaka", qualification: "MBBS, MD (Chest Medicine)", experience: 17, rating: 4.7, consultationFee: 1500, phone: "01722-345678" },

  // Chittagong
  { name: "Dr. Abdul Karim Chowdhury", specialty: "Gastroenterologist", hospital: "Chittagong Medical College Hospital", city: "Chittagong", qualification: "MBBS, MD (Gastroenterology)", experience: 14, rating: 4.7, consultationFee: 1200, phone: "01811-234567" },
  { name: "Dr. Momtaz Begum", specialty: "Cardiologist", hospital: "Chevron Hospital Chittagong", city: "Chittagong", qualification: "MBBS, MD (Cardiology)", experience: 18, rating: 4.8, consultationFee: 1800, phone: "01812-345678" },
  { name: "Dr. Shamsul Alam", specialty: "Orthopedic", hospital: "Cox's Bazar Medical College", city: "Chittagong", qualification: "MBBS, MS (Orthopedics)", experience: 12, rating: 4.6, consultationFee: 1200, phone: "01813-456789" },
  { name: "Dr. Farhana Islam", specialty: "Gynecologist", hospital: "Chittagong Ma-O-Shishu Hospital", city: "Chittagong", qualification: "MBBS, FCPS (Gynecology)", experience: 16, rating: 4.8, consultationFee: 1000, phone: "01814-567890" },
  { name: "Dr. Nuruzzaman", specialty: "Pediatrician", hospital: "Chittagong Medical College Hospital", city: "Chittagong", qualification: "MBBS, DCH, FCPS", experience: 13, rating: 4.7, consultationFee: 900, phone: "01815-678901" },
  { name: "Dr. Hasina Akter", specialty: "Dermatologist", hospital: "Chittagong Skin Clinic", city: "Chittagong", qualification: "MBBS, DDV", experience: 9, rating: 4.5, consultationFee: 800, phone: "01816-789012" },
  { name: "Dr. Rafiqul Hasan", specialty: "Neurologist", hospital: "Park View Hospital Chittagong", city: "Chittagong", qualification: "MBBS, MD (Neurology)", experience: 15, rating: 4.7, consultationFee: 1500, phone: "01817-890123" },

  // Barisal
  { name: "Dr. Mozammel Haq", specialty: "General Physician", hospital: "Sher-e-Bangla Medical College Hospital", city: "Barisal", qualification: "MBBS, FCPS (Medicine)", experience: 15, rating: 4.6, consultationFee: 600, phone: "01911-234567" },
  { name: "Dr. Roksana Begum", specialty: "Gynecologist", hospital: "Barisal General Hospital", city: "Barisal", qualification: "MBBS, FCPS (Gynecology)", experience: 12, rating: 4.7, consultationFee: 700, phone: "01912-345678" },
  { name: "Dr. Jahangir Alam", specialty: "Gastroenterologist", hospital: "Sher-e-Bangla Medical College Hospital", city: "Barisal", qualification: "MBBS, MD (Gastroenterology)", experience: 10, rating: 4.6, consultationFee: 900, phone: "01913-456789" },
  { name: "Dr. Shahida Khanam", specialty: "Pediatrician", hospital: "Barisal Shishu Hospital", city: "Barisal", qualification: "MBBS, DCH", experience: 8, rating: 4.5, consultationFee: 600, phone: "01914-567890" },
  { name: "Dr. Abdur Razzak", specialty: "Orthopedic", hospital: "Sher-e-Bangla Medical College Hospital", city: "Barisal", qualification: "MBBS, MS (Orthopedics)", experience: 11, rating: 4.6, consultationFee: 800, phone: "01915-678901" },
  { name: "Dr. Nasima Akter", specialty: "Cardiologist", hospital: "Barisal Cardiac Center", city: "Barisal", qualification: "MBBS, MD (Cardiology)", experience: 13, rating: 4.7, consultationFee: 1000, phone: "01916-789012" },

  // Rajshahi
  { name: "Dr. Mizanur Rahman", specialty: "Neurologist", hospital: "Rajshahi Medical College Hospital", city: "Rajshahi", qualification: "MBBS, MD (Neurology)", experience: 17, rating: 4.8, consultationFee: 1000, phone: "01711-111222" },
  { name: "Dr. Firoza Khatun", specialty: "Gynecologist", hospital: "Rajshahi Medical College Hospital", city: "Rajshahi", qualification: "MBBS, FCPS (Gynecology)", experience: 14, rating: 4.7, consultationFee: 800, phone: "01711-222333" },
  { name: "Dr. Harunur Rashid", specialty: "General Physician", hospital: "Rajshahi City Hospital", city: "Rajshahi", qualification: "MBBS, FCPS (Medicine)", experience: 12, rating: 4.6, consultationFee: 600, phone: "01711-333444" },
  { name: "Dr. Shirin Akhter", specialty: "Dermatologist", hospital: "Rajshahi Skin Care Center", city: "Rajshahi", qualification: "MBBS, DDV", experience: 9, rating: 4.5, consultationFee: 700, phone: "01711-444555" },
  { name: "Dr. Alamgir Hossain", specialty: "Orthopedic", hospital: "Rajshahi Medical College Hospital", city: "Rajshahi", qualification: "MBBS, MS (Orthopedics)", experience: 16, rating: 4.7, consultationFee: 900, phone: "01711-555666" },

  // Sylhet
  { name: "Dr. Sadequl Islam", specialty: "Cardiologist", hospital: "Sylhet MAG Osmani Medical College Hospital", city: "Sylhet", qualification: "MBBS, MD (Cardiology)", experience: 20, rating: 4.8, consultationFee: 1200, phone: "01811-111222" },
  { name: "Dr. Nilufa Yasmin", specialty: "Pediatrician", hospital: "Sylhet Women's Medical College", city: "Sylhet", qualification: "MBBS, DCH, FCPS", experience: 11, rating: 4.7, consultationFee: 800, phone: "01811-222333" },
  { name: "Dr. Bazlur Rahman", specialty: "Gastroenterologist", hospital: "Sylhet MAG Osmani Hospital", city: "Sylhet", qualification: "MBBS, MD (Gastroenterology)", experience: 13, rating: 4.6, consultationFee: 1000, phone: "01811-333444" },
  { name: "Dr. Mahjabeen Khanam", specialty: "Gynecologist", hospital: "Sylhet Women's Medical College", city: "Sylhet", qualification: "MBBS, FCPS (Gynecology)", experience: 15, rating: 4.8, consultationFee: 900, phone: "01811-444555" },

  // Khulna
  { name: "Dr. Rezaul Karim", specialty: "General Physician", hospital: "Khulna Medical College Hospital", city: "Khulna", qualification: "MBBS, FCPS (Medicine)", experience: 13, rating: 4.6, consultationFee: 600, phone: "01911-111222" },
  { name: "Dr. Fatema Akter", specialty: "Gynecologist", hospital: "Khulna General Hospital", city: "Khulna", qualification: "MBBS, FCPS (Gynecology)", experience: 11, rating: 4.7, consultationFee: 700, phone: "01911-222333" },
  { name: "Dr. Nasiruddin Ahmed", specialty: "Orthopedic", hospital: "Khulna Medical College Hospital", city: "Khulna", qualification: "MBBS, MS (Orthopedics)", experience: 14, rating: 4.6, consultationFee: 800, phone: "01911-333444" },
  { name: "Dr. Rabeya Sultana", specialty: "Dermatologist", hospital: "Khulna Skin Clinic", city: "Khulna", qualification: "MBBS, DDV", experience: 8, rating: 4.5, consultationFee: 600, phone: "01911-444555" },

  // Comilla
  { name: "Dr. Aminur Islam Chowdhury", specialty: "Cardiologist", hospital: "Comilla Medical College Hospital", city: "Comilla", qualification: "MBBS, MD (Cardiology)", experience: 16, rating: 4.7, consultationFee: 1000, phone: "01711-777888" },
  { name: "Dr. Nazma Begum", specialty: "Pediatrician", hospital: "Comilla General Hospital", city: "Comilla", qualification: "MBBS, DCH", experience: 10, rating: 4.6, consultationFee: 600, phone: "01711-888999" },
  { name: "Dr. Helal Uddin", specialty: "General Physician", hospital: "Comilla Medical College Hospital", city: "Comilla", qualification: "MBBS, FCPS (Medicine)", experience: 12, rating: 4.5, consultationFee: 500, phone: "01711-999000" },

  // Mymensingh
  { name: "Dr. Golam Mostafa", specialty: "Gastroenterologist", hospital: "Mymensingh Medical College Hospital", city: "Mymensingh", qualification: "MBBS, MD (Gastroenterology)", experience: 14, rating: 4.7, consultationFee: 900, phone: "01811-777888" },
  { name: "Dr. Sharmila Devi", specialty: "Gynecologist", hospital: "Mymensingh Medical College Hospital", city: "Mymensingh", qualification: "MBBS, FCPS (Gynecology)", experience: 12, rating: 4.7, consultationFee: 700, phone: "01811-888999" },
  { name: "Dr. Abdus Salam", specialty: "Neurologist", hospital: "Mymensingh Medical College Hospital", city: "Mymensingh", qualification: "MBBS, MD (Neurology)", experience: 13, rating: 4.6, consultationFee: 900, phone: "01811-999000" },
];

async function seed() {
  console.log("Checking if doctors already exist...");
  const existing = await db.select().from(doctorsTable);
  if (existing.length > 0) {
    console.log(`${existing.length} doctors already in database. Skipping seed.`);
    return;
  }

  console.log(`Seeding ${doctors.length} doctors...`);
  await db.insert(doctorsTable).values(doctors);
  console.log("Seed complete!");
}

seed().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
