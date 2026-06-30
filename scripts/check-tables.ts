import { prisma } from '@/config/database'

async function checkTables() {
  console.log('🔍 Memeriksa tabel database...')

  const tables = ['users', 'categories', 'words', 'audios', 'sync_meta']

  for (const table of tables) {
    try {
      const count = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM ${table}`
      )
      console.log(`✅ ${table}: OK`, count)
    } catch (err) {
      console.error(`❌ ${table}:`, (err as Error).message)
    }
  }

  await prisma.$disconnect()
}

checkTables()
