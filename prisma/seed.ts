import { prisma } from "@/config/database";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // Buat SUPER_ADMIN default
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { id: "super-admin-seed" },
    update: {},
    create: {
      id: "super-admin-seed",
      username: "admin",
      name: "Administrator",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✅ User admin: ${admin.username} / admin123`);

  // Buat kategori awal
  const categories = [
    "Kata Ganti",
    "Kata Kerja",
    "Kata Sifat",
    "Kata Benda",
    "Angka",
    "Sapaan",
    "Warna",
    "Arah",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { id: `seed-category-${name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        id: `seed-category-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
      },
    });
  }

  console.log(`✅ ${categories.length} kategori dibuat`);

  // Init sync_meta
  await prisma.syncMeta.upsert({
    where: { key: "sync_version" },
    update: {},
    create: {
      key: "sync_version",
      value: "1",
    },
  });

  console.log("✅ Sync meta diinisialisasi");
  console.log("🎉 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
