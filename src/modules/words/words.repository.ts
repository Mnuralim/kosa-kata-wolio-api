import { prisma } from '@/config/database'
import type { Prisma } from '@/generated/prisma/client'

export const wordsRepository = {
  async findAll(params: {
    skip: number
    take: number
    search?: string
    categoryId?: string
    hasAudio?: string
    hasScript?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const where: Prisma.WordWhereInput = { isDeleted: false }

    if (params.search) {
      where.OR = [
        { indonesian: { contains: params.search } },
        { localLanguage: { contains: params.search } },
        { localScript: { contains: params.search } }
      ]
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId
    }

    if (params.hasAudio === 'true') {
      where.audios = { some: { isDeleted: false } }
    } else if (params.hasAudio === 'false') {
      where.audios = { none: { isDeleted: false } }
    }

    if (params.hasScript === 'true') {
      where.localScript = { not: null }
    } else if (params.hasScript === 'false') {
      where.localScript = null
    }

    const orderBy = params.sortBy
      ? { [params.sortBy]: params.sortOrder ?? 'desc' }
      : { createdAt: 'desc' as const }

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
        orderBy,
        take: params.take,
        skip: params.skip
      }),
      prisma.word.count({ where })
    ])

    return { words, total }
  },

  findById(id: string) {
    return prisma.word.findFirst({
      where: { id, isDeleted: false },
      include: {
        category: { select: { id: true, name: true } },
        audios: {
          where: { isDeleted: false },
          select: { id: true, url: true }
        }
      }
    })
  },

  findDuplicate(
    indonesian: string,
    localLanguage: string,
    categoryId: string,
    excludeId?: string
  ) {
    return prisma.word.findFirst({
      where: {
        indonesian,
        localLanguage,
        categoryId,
        isDeleted: false,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    })
  },

  create(data: {
    indonesian: string
    localLanguage: string
    localScript: string | null
    categoryId: string
    audioUrls: string[]
  }) {
    return prisma.word.create({
      data: {
        indonesian: data.indonesian,
        localLanguage: data.localLanguage,
        localScript: data.localScript,
        categoryId: data.categoryId,
        audios:
          data.audioUrls.length > 0
            ? { create: data.audioUrls.map((url) => ({ url })) }
            : undefined
      },
      include: {
        category: { select: { id: true, name: true } },
        audios: { select: { id: true, url: true } }
      }
    })
  },

  update(
    id: string,
    data: {
      indonesian: string
      localLanguage: string
      localScript: string | null
      categoryId: string
    }
  ) {
    return prisma.word.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true } },
        audios: {
          where: { isDeleted: false },
          select: { id: true, url: true }
        }
      }
    })
  },

  updateLocalScript(id: string, localScript: string | null) {
    return prisma.word.update({
      where: { id },
      data: { localScript }
    })
  },

  softDelete(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.audio.updateMany({
        where: { wordId: id, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() }
      })

      return tx.word.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() }
      })
    })
  },

  // Audio operations
  addAudio(wordId: string, url: string) {
    return prisma.audio.create({
      data: { url, wordId }
    })
  },

  deleteAudio(audioId: string) {
    return prisma.audio.update({
      where: { id: audioId },
      data: { isDeleted: true, deletedAt: new Date() }
    })
  },

  replaceAudio(wordId: string, url: string) {
    return prisma.$transaction(async (tx) => {
      await tx.audio.updateMany({
        where: { wordId, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() }
      })

      return tx.audio.create({
        data: { url, wordId }
      })
    })
  },

  replaceAudiosBulk(wordId: string, urls: string[]) {
    return prisma.$transaction(async (tx) => {
      await tx.audio.updateMany({
        where: { wordId, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() }
      })

      if (urls.length > 0) {
        await tx.audio.createMany({
          data: urls.map((url) => ({ url, wordId }))
        })
      }
    })
  },

  findAudioById(audioId: string) {
    return prisma.audio.findFirst({
      where: { id: audioId, isDeleted: false }
    })
  },

  // Sync
  findAllUpdated(params: {
    skip: number
    take: number
    updatedAfter?: Date
  }) {
    const where: Prisma.WordWhereInput = { isDeleted: false }

    if (params.updatedAfter) {
      where.updatedAt = { gte: params.updatedAfter }
    }

    return prisma.word.findMany({
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
    })
  },

  countUpdated(updatedAfter?: Date) {
    const where: Prisma.WordWhereInput = { isDeleted: false }
    if (updatedAfter) {
      where.updatedAt = { gte: updatedAfter }
    }
    return prisma.word.count({ where })
  },

  findAllCategories() {
    return prisma.category.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true, updatedAt: true },
      orderBy: { updatedAt: 'asc' }
    })
  },

  // Dashboard stats
  async getStats() {
    const [
      totalWords,
      totalCategories,
      wordsWithAudio,
      wordsWithScript
    ] = await Promise.all([
      prisma.word.count({ where: { isDeleted: false } }),
      prisma.category.count({ where: { isDeleted: false } }),
      prisma.word.count({
        where: { isDeleted: false, audios: { some: { isDeleted: false } } }
      }),
      prisma.word.count({
        where: { isDeleted: false, localScript: { not: null } }
      })
    ])

    return { totalWords, totalCategories, wordsWithAudio, wordsWithScript }
  }
}
