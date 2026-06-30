import { prisma } from "@/config/database";
import bcrypt from "bcryptjs";

const CATEGORIES = [
  "Kata Benda",
  "Kata Benda/Sapaan",
  "Kata Bilangan",
  "Kata Depan",
  "Kata Ganti",
  "Kata Hubung",
  "Kata Kerja",
  "Kata Kerja/Sifat",
  "Kata Keterangan",
  "Kata Seru",
  "Kata Sifat",
  "Kata Tanya",
  "Kata Tunjuk",
];

const WORDS: {
  localLanguage: string;
  indonesian: string;
  localScript: string;
  category: string;
}[] = [
  { localLanguage: "rapu", indonesian: "abu", localScript: "رَڨُو", category: "Kata Benda" },
  { localLanguage: "uwe", indonesian: "air", localScript: "ﺍُ ﻭَ ﻱِ", category: "Kata Benda" },
  { localLanguage: "usara", indonesian: "akar", localScript: "اوْسَرَ", category: "Kata Benda" },
  { localLanguage: "yaku", indonesian: "aku", localScript: "يَكُو", category: "Kata Ganti" },
  { localLanguage: "jala", indonesian: "alir(me)", localScript: "جَلاَ", category: "Kata Kerja" },
  { localLanguage: "Iko", indonesian: "Kamu", localScript: "اِكُو", category: "Kata Ganti" },
  { localLanguage: "aahera", indonesian: "akhirat", localScript: "اَاخٖيرَة", category: "Kata Benda" },
  { localLanguage: "aahiri", indonesian: "akhir", localScript: "اَاخٖيرِي", category: "Kata Keterangan" },
  { localLanguage: "aamani", indonesian: "aman", localScript: "اَامَانِي", category: "Kata Sifat" },
  { localLanguage: "acara", indonesian: "acara, acar(sayur)", localScript: "اَچَارَ", category: "Kata Benda" },
  { localLanguage: "ae", indonesian: "kaki", localScript: "اَيٖ", category: "Kata Benda" },
  { localLanguage: "ajala", indonesian: "ajal", localScript: "اَجَالَ", category: "Kata Benda" },
  { localLanguage: "ajima", indonesian: "azimat", localScript: "اَجٖيمَ", category: "Kata Benda" },
  { localLanguage: "alamati", indonesian: "alamat", localScript: "اَلَامَتِي", category: "Kata Benda" },
  { localLanguage: "alamu", indonesian: "alam", localScript: "اَلَامُو", category: "Kata Benda" },
  { localLanguage: "ana", indonesian: "anak", localScript: "اَنَ", category: "Kata Benda" },
  { localLanguage: "ngalu", indonesian: "angin", localScript: "غَالُو", category: "Kata Benda" },
  { localLanguage: "mantoa", indonesian: "anjing", localScript: "مَنْتٗوا", category: "Kata Benda" },
  { localLanguage: "opea", indonesian: "apa", localScript: "اٗوڤٖيا", category: "Kata Tanya" },
  { localLanguage: "lanto", indonesian: "apung", localScript: "لَنْتٗو", category: "Kata Sifat" },
  { localLanguage: "waa", indonesian: "api", localScript: "وَاء", category: "Kata Benda" },
  { localLanguage: "ombu", indonesian: "asap", localScript: "اٗوْمْبُو", category: "Kata Benda" },
  { localLanguage: "wolu", indonesian: "awan", localScript: "وٗولُو", category: "Kata Benda" },
  { localLanguage: "tuapa", indonesian: "bagaimana", localScript: "تُوَڤَ", category: "Kata Tanya" },
  { localLanguage: "malape", indonesian: "baik", localScript: "مَالَڤٖي", category: "Kata Sifat" },
  { localLanguage: "tunu", indonesian: "bakar", localScript: "تُوْنُو", category: "Kata Kerja" },
  { localLanguage: "balili", indonesian: "balik", localScript: "بَلٖيلٖي", category: "Kata Kerja" },
  { localLanguage: "bari", indonesian: "banyak", localScript: "بَارِي", category: "Kata Sifat" },
  { localLanguage: "ama", indonesian: "bapak", localScript: "اَمَ", category: "Kata Benda/Sapaan" },
  { localLanguage: "azabu", indonesian: "azab", localScript: "اَزَابُو", category: "Kata Benda" },
  { localLanguage: "bae", indonesian: "padi, beras", localScript: "بَيٖ", category: "Kata Benda" },
  { localLanguage: "baho", indonesian: "basah", localScript: "بَاهٗو", category: "Kata Sifat" },
  { localLanguage: "baga", indonesian: "pipi", localScript: "بَاغَ", category: "Kata Benda" },
  { localLanguage: "bhula", indonesian: "bulan", localScript: "بٖهُلَ", category: "Kata Benda" },
  { localLanguage: "bandera", indonesian: "bendera", localScript: "بَنْدٖيرَ", category: "Kata Benda" },
  { localLanguage: "bangasa", indonesian: "palak", localScript: "بَغَاسَ", category: "Kata Benda" },
  { localLanguage: "bangka", indonesian: "perahu", localScript: "بَغْكَ", category: "Kata Benda" },
  { localLanguage: "kandole-dole", indonesian: "baring", localScript: "كَنْدٗولٖي-دٗولٖي", category: "Kata Kerja" },
  { localLanguage: "baau", indonesian: "baru", localScript: "بَاءُو", category: "Kata Sifat" },
  { localLanguage: "magode", indonesian: "basah", localScript: "مَاغٗودٖي", category: "Kata Sifat" },
  { localLanguage: "batu", indonesian: "batu", localScript: "بَاتُو", category: "Kata Benda" },
  { localLanguage: "sagaa", indonesian: "beberapa", localScript: "سَاغَاء", category: "Kata Bilangan" },
  { localLanguage: "aweta", indonesian: "belah (me)", localScript: "اَوٖيتَ", category: "Kata Kerja" },
  { localLanguage: "totuu", indonesian: "benar", localScript: "تٗوتُوُو", category: "Kata Sifat" },
  { localLanguage: "tente", indonesian: "bengkak", localScript: "تٖنْتٖي", category: "Kata Sifat" },
  { localLanguage: "wine", indonesian: "benih", localScript: "وٖينٖي", category: "Kata Benda" },
  { localLanguage: "matamo", indonesian: "berat", localScript: "مَاتَمٗو", category: "Kata Sifat" },
  { localLanguage: "pongano", indonesian: "berenang", localScript: "ڤٗوغَانٗو", category: "Kata Kerja" },
  { localLanguage: "dawu", indonesian: "beri", localScript: "دَوُو", category: "Kata Kerja" },
  { localLanguage: "lingka", indonesian: "berjalan", localScript: "لٖيغْكَ", category: "Kata Kerja" },
  { localLanguage: "maoge", indonesian: "besar", localScript: "مَاوٗغٖي", category: "Kata Sifat" },
  { localLanguage: "ande", indonesian: "bilamana", localScript: "اَنْدٖي", category: "Kata Tanya" },
  { localLanguage: "binata", indonesian: "binatang", localScript: "بٖينَاتَ", category: "Kata Benda" },
  { localLanguage: "kalipopo", indonesian: "bintang", localScript: "كَالٖيْڤٗوڤٗو", category: "Kata Benda" },
  { localLanguage: "bhake", indonesian: "buah", localScript: "بٖهَاكٖي", category: "Kata Benda" },
  { localLanguage: "bulua", indonesian: "bulu", localScript: "بُوْلُوَا", category: "Kata Benda" },
  { localLanguage: "kamba", indonesian: "bunga", localScript: "كَمْبَ", category: "Kata Benda" },
  { localLanguage: "pekamate", indonesian: "bunuh", localScript: "ڤٖيكَمَاتٖي", category: "Kata Kerja" },
  { localLanguage: "madaki", indonesian: "buruk", localScript: "مَدَاكٖي", category: "Kata Sifat" },
  { localLanguage: "manu-manu", indonesian: "burung", localScript: "مَانُو-مَانُو", category: "Kata Benda" },
  { localLanguage: "mabuto", indonesian: "busuk", localScript: "مَبُوْتٗو", category: "Kata Sifat" },
  { localLanguage: "bhou", indonesian: "cium", localScript: "بٖهٗوْو", category: "Kata Kerja" },
  { localLanguage: "taphasi", indonesian: "cuci", localScript: "تَڤٖهَاسٖي", category: "Kata Kerja" },
  { localLanguage: "anto", indonesian: "daging", localScript: "اَنْتٗو", category: "Kata Benda" },
  { localLanguage: "te", indonesian: "dan", localScript: "تٖي", category: "Kata Hubung" },
  { localLanguage: "umala", indonesian: "danau", localScript: "اُمَالَ", category: "Kata Benda" },
  { localLanguage: "raa", indonesian: "darah", localScript: "رَاء", category: "Kata Benda" },
  { localLanguage: "kawa", indonesian: "datang", localScript: "كَاوَ", category: "Kata Kerja" },
  { localLanguage: "lae", indonesian: "daun", localScript: "لَيٖ", category: "Kata Benda" },
  { localLanguage: "ngawu", indonesian: "debu", localScript: "غَاوُو", category: "Kata Benda" },
  { localLanguage: "makasu", indonesian: "dekat", localScript: "مَكَاسُو", category: "Kata Sifat" },
  { localLanguage: "rango", indonesian: "dengar", localScript: "رَغٗو", category: "Kata Kerja" },
  { localLanguage: "ginunca", indonesian: "di  dalam", localScript: "غٖينُنْچَ", category: "Kata Depan" },
  { localLanguage: "wesyi", indonesian: "di sini", localScript: "وٖيسْيٖي", category: "Kata Tunjuk" },
  { localLanguage: "weitu", indonesian: "di situ", localScript: "وٖيٖيْتُو", category: "Kata Tunjuk" },
  { localLanguage: "yapai", indonesian: "dimana", localScript: "يَڤَي", category: "Kata Tanya" },
  { localLanguage: "magari", indonesian: "dingin", localScript: "مَاغَارِي", category: "Kata Sifat" },
  { localLanguage: "cabo", indonesian: "sabun", localScript: "چَابٗو", category: "Kata Benda" },
  { localLanguage: "cahea", indonesian: "cahaya", localScript: "چَهٖيَا", category: "Kata Benda" },
  { localLanguage: "cere", indonesian: "cerek", localScript: "چٖيرٖي", category: "Kata Benda" },
  { localLanguage: "daangia", indonesian: "ada", localScript: "دَاءغٖيَا", category: "Kata Kerja" },
  { localLanguage: "dangiapo", indonesian: "masih ada", localScript: "دَغٖيَاڤٗو", category: "Kata Kerja" },
  { localLanguage: "dangku", indonesian: "terbentur", localScript: "دَغْكُو", category: "Kata Kerja" },
  { localLanguage: "jujuraa", indonesian: "dorong", localScript: "جُوْجُوْرَاء", category: "Kata Kerja" },
  { localLanguage: "rua", indonesian: "dua", localScript: "رُوَا", category: "Kata Bilangan" },
  { localLanguage: "ncura", indonesian: "duduk", localScript: "نْچُوْرَ", category: "Kata Kerja" },
  { localLanguage: "lenci", indonesian: "ekor", localScript: "لٖينْچٖي", category: "Kata Benda" },
  { localLanguage: "pata", indonesian: "empat", localScript: "ڤَاتَ", category: "Kata Bilangan" },
  { localLanguage: "yingko", indonesian: "engkau", localScript: "يٖيغْكٗو", category: "Kata Ganti" },
  { localLanguage: "seli", indonesian: "gali", localScript: "سٖيلٖي", category: "Kata Kerja" },
  { localLanguage: "gara", indonesian: "garam", localScript: "غَارَ", category: "Kata Benda" },
  { localLanguage: "kangkanu", indonesian: "garuk", localScript: "كَغْكَنُو", category: "Kata Kerja" },
  { localLanguage: "malompo", indonesian: "gemuk", localScript: "مَلٗومْڤٗو", category: "Kata Sifat" },
  { localLanguage: "nginci", indonesian: "gigi", localScript: "غٖينْچٖي", category: "Kata Benda" },
  { localLanguage: "papaki", indonesian: "gigit", localScript: "ڤَاڤَكٖي", category: "Kata Kerja" },
  { localLanguage: "kikisi", indonesian: "gosok", localScript: "كٖيكٖيسٖي", category: "Kata Kerja" },
  { localLanguage: "gunu", indonesian: "gunung", localScript: "غُوْنُو", category: "Kata Benda" },
  { localLanguage: "tapako", indonesian: "hantam", localScript: "تَڤَاكٗو", category: "Kata Kerja" },
  { localLanguage: "hapusu", indonesian: "hapus", localScript: "هَڤُوْسُو", category: "Kata Kerja" },
  { localLanguage: "ngangaranda", indonesian: "hati", localScript: "غَاغَارَنْدَ", category: "Kata Benda" },
  { localLanguage: "ango", indonesian: "hidung", localScript: "اَغٗو", category: "Kata Benda" },
  { localLanguage: "dadi", indonesian: "hidup", localScript: "دَادِي", category: "Kata Kerja/Sifat" },
  { localLanguage: "ijo", indonesian: "hijau", localScript: "اٖيجٗو", category: "Kata Sifat" },
  { localLanguage: "gomi", indonesian: "hisap", localScript: "غٗومٖي", category: "Kata Kerja" },
  { localLanguage: "maeta", indonesian: "hitam", localScript: "مَيٖتَ", category: "Kata Sifat" },
  { localLanguage: "gagari", indonesian: "hitung", localScript: "غَاغَارِي", category: "Kata Kerja" },
  { localLanguage: "kowao", indonesian: "hujan", localScript: "كٗووَاوٗو", category: "Kata Benda" },
  { localLanguage: "koo", indonesian: "hutan", localScript: "كٗوْو", category: "Kata Benda" },
  { localLanguage: "yincia", indonesian: "ia", localScript: "يٖينْچٖيَا", category: "Kata Ganti" },
  { localLanguage: "ina", indonesian: "ibu", localScript: "اٖينَ", category: "Kata Benda/Sapaan" },
  { localLanguage: "ikane", indonesian: "ikan", localScript: "اٖيكَنٖي", category: "Kata Benda" },
  { localLanguage: "siy", indonesian: "ini", localScript: "سٖي", category: "Kata Tunjuk" },
  { localLanguage: "bhawine", indonesian: "istri", localScript: "بٖهَاوٖينٖي", category: "Kata Benda" },
  { localLanguage: "syitu", indonesian: "itu", localScript: "سْيٖيْتُو", category: "Kata Tunjuk" },
  { localLanguage: "garangga", indonesian: "agar-agar", localScript: "غَرَغْغَ", category: "Kata Benda" },
  { localLanguage: "basaraa", indonesian: "agung", localScript: "بَسَرَاء", category: "Kata Sifat" },
  { localLanguage: "yaakutu", indonesian: "batu permata", localScript: "يَاءكُوْتُو", category: "Kata Benda" },
  { localLanguage: "saopea", indonesian: "berapa", localScript: "سَاٗوڤٖيَا", category: "Kata Tanya" },
  { localLanguage: "singkaru", indonesian: "cincin", localScript: "سٖيغْكَارُو", category: "Kata Benda" },
  { localLanguage: "hakeekati", indonesian: "hakikat", localScript: "هَكٖيْكَاتٖي", category: "Kata Benda" },
  { localLanguage: "raraea", indonesian: "hari raya", localScript: "رَرَايٖءَا", category: "Kata Benda" },
  { localLanguage: "lentu", indonesian: "hitung", localScript: "لٖينْتُو", category: "Kata Kerja" },
  { localLanguage: "kagarai", indonesian: "ikan asin", localScript: "كَاغَرَاي", category: "Kata Benda" },
  { localLanguage: "isilamu", indonesian: "islam", localScript: "اٖيسٖيلَامُو", category: "Kata Benda" },
  { localLanguage: "kaitela", indonesian: "jagung", localScript: "كَيٖتٖيلَ", category: "Kata Benda" },
  { localLanguage: "tombo", indonesian: "jambu air", localScript: "تٗومْبٗو", category: "Kata Benda" },
  { localLanguage: "bulamalaka", indonesian: "jambu biji", localScript: "بُوْلَمَالَاكَ", category: "Kata Benda" },
  { localLanguage: "kuwu", indonesian: "jamur", localScript: "كُوْوُو", category: "Kata Benda" },
  { localLanguage: "asala", indonesian: "jangan sampai", localScript: "اَسَالَ", category: "Kata Seru" },
  { localLanguage: "jini", indonesian: "jin", localScript: "جٖينٖي", category: "Kata Benda" },
  { localLanguage: "jiwa", indonesian: "jiwa", localScript: "جٖيوَ", category: "Kata Benda" },
  { localLanguage: "joge", indonesian: "joget", localScript: "جٗوغٖي", category: "Kata Kerja" },
  { localLanguage: "jumaa", indonesian: "jumat", localScript: "جُوْمَاء", category: "Kata Benda" },
  { localLanguage: "kapala", indonesian: "kapal", localScript: "كَڤَالَ", category: "Kata Benda" },
  { localLanguage: "kaudawa", indonesian: "kelor", localScript: "كَاوْدَاوَ", category: "Kata Benda" },
  { localLanguage: "buntuli", indonesian: "lari", localScript: "بُنْتُوْلٖي", category: "Kata Kerja" },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Super admin
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

  // Kategori — upsert via name (unique)
  const categoryMap: Record<string, string> = {};
  for (const name of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryMap[name] = cat.id;
  }
  console.log(`✅ ${CATEGORIES.length} kategori dibuat`);

  // Kata — skip duplikat berdasarkan kombinasi localLanguage + indonesian + categoryId
  let created = 0;
  for (const word of WORDS) {
    const categoryId = categoryMap[word.category];
    if (!categoryId) {
      console.warn(`⚠️  Kategori tidak ditemukan: ${word.category}`);
      continue;
    }
    const existing = await prisma.word.findFirst({
      where: { localLanguage: word.localLanguage, indonesian: word.indonesian, categoryId },
    });
    if (!existing) {
      await prisma.word.create({
        data: {
          indonesian: word.indonesian,
          localLanguage: word.localLanguage,
          localScript: word.localScript,
          categoryId,
        },
      });
      created++;
    }
  }
  console.log(`✅ ${created} kata dibuat`);

  // Sync meta
  await prisma.syncMeta.upsert({
    where: { key: "sync_version" },
    update: {},
    create: { key: "sync_version", value: "1" },
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
