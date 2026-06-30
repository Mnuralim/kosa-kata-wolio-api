import { prisma } from '@/config/database'

export const syncRepository = {
  async findAllWords(params: {
    skip: number
    take: number
    updatedAfter?: Date
  }) {
    const where = {
      isDeleted: false,
      ...(params.updatedAfter ? { updatedAt: { gte: params.updatedAfter } } : {})
    }

    const [words, total] = await Promise.all([
      prisma.word.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          audios: {
            where: { isDeleted: false },
            select: { id: true, url: true }
          }
        },
        orderBy: { updatedAt: 'asc' },
        take: params.take,
        skip: params.skip
      }),
      prisma.word.count({ where })
    ])

    return { words, total }
  },

  async findAllCategories(params: {
    skip: number
    take: number
    updatedAfter?: Date
  }) {
    const where = {
      isDeleted: false,
      ...(params.updatedAfter ? { updatedAt: { gte: params.updatedAfter } } : {})
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { words: { where: { isDeleted: false } } }
          }
        },
        orderBy: { updatedAt: 'asc' },
        take: params.take,
        skip: params.skip
      }),
      prisma.category.count({ where })
    ])

    return { categories, total }
  },

  async getSyncVersion() {
    const meta = await prisma.syncMeta.findFirst({
      where: { key: 'sync_version' }
    })

    // Hitung versi dari max updatedAt
    const [lastWordUpdate, lastCategoryUpdate] = await Promise.all([
      prisma.word.findFirst({
        where: { isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      }),
      prisma.category.findFirst({
        where: { isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      })
    ])

    const version = meta?.value ?? '1'
    const lastSync =
      lastWordUpdate || lastCategoryUpdate
        ? new Date(
            Math.max(
              lastWordUpdate?.updatedAt?.getTime() ?? 0,
              lastCategoryUpdate?.updatedAt?.getTime() ?? 0
            )
          ).toISOString()
        : new Date().toISOString()

    return { version, lastSync }
  }
}
