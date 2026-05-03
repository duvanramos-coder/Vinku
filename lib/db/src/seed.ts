
import { db } from "./index.js";
import { plansTable } from "./schema/plans.js";
import { usersTable } from "./schema/users.js";
import { planAttendeesTable } from "./schema/usersToPlans.js";

async function main() {
  console.log("🌱 Seeding database...");

  const data: (typeof plansTable.$inferInsert)[] = [
    {
      title: "Fútbol 5 Mixto",
      category: "Deportes",
      description: "Únete a nuestro partido de fútbol 5 mixto. ¡Todos los niveles son bienvenidos!",
      location: "Canchas del Parque",
      date: "2024-07-15",
      time: "18:00",
      totalCupos: 10,
      availableCupos: 10,
      image: "https://picsum.photos/400/300?random=1",
    },
    {
      title: "Cata de Café",
      category: "Gastronomía",
      description: "Explora los sabores y aromas del café de la región en nuestra cata especializada.",
      location: "Café Central",
      date: "2024-07-16",
      time: "16:00",
      totalCupos: 5,
      availableCupos: 5,
      image: "https://picsum.photos/400/300?random=2",
    },
    {
      title: "Clase de Yoga al aire libre",
      category: "Bienestar",
      description: "Conéctate con la naturaleza y encuentra tu paz interior en nuestra clase de yoga en el parque.",
      location: "Jardín Botánico",
      date: "2024-07-17",
      time: "07:00",
      totalCupos: 20,
      availableCupos: 20,
      image: "https://picsum.photos/400/300?random=3",
    },
  ];

  // Clear existing data
  console.log("🗑️ Deleting existing data...");
  await db.delete(planAttendeesTable);
  await db.delete(plansTable);
  await db.delete(usersTable);

  // Insert new data
  console.log("📝 Inserting new data...");
  await db.insert(plansTable).values(data);

  console.log("✅ Database seeded successfully!");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error seeding database:", err);
  process.exit(1);
});
