import { prisma } from '@/config/database'
import type { Prisma } from '@/generated/prisma/client'

export const categoriesRepository = {
  async findAll(params: {
    skip: number
    take: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const where: Prisma.CategoryWhereInput = { isDeleted: false }

    if (params.search) {
      where.name = { contains: params.search }
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { words: { where: { isDeleted: false } } }
          }
        },
        orderBy: { [params.sortBy ?? 'createdAt']: params.sortOrder ?? 'desc' },
        take: params.take,
        skip: params.skip
      }),
      prisma.category.count({ where })
    ])

    return { categories, total }
  },

  findAllSimple() {
    return prisma.category.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  },

  findById(id: string) {
    return prisma.category.findFirst({
      where: { id, isDeleted: false },
      include: {
        _count: {
          select: { words: { where: { isDeleted: false } } }
        }
      }
    })
  },

  findByName(name: string, excludeId?: string) {
    return prisma.category.findFirst({
      where: {
        name,
        isDeleted: false,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    })
  },

  create(name: string) {
    return prisma.category.create({ data: { name } })
  },

  update(id: string, name: string) {
    return prisma.category.update({
      where: { id },
      data: { name },
      include: {
        _count: {
          select: { words: { where: { isDeleted: false } } }
        }
      }
    })
  },

  softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    })
  },

  countWords(categoryId: string) {
    return prisma.word.count({
      where: { categoryId, isDeleted: false }
    })
  }
}
