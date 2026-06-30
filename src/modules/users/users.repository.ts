import { prisma } from '@/config/database'
import type { Prisma } from '@/generated/prisma/client'

export const usersRepository = {
  async findAll(params: {
    skip: number
    take: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const where: Prisma.UserWhereInput = { isDeleted: false }

    if (params.search) {
      where.OR = [
        { username: { contains: params.search } },
        { name: { contains: params.search } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { [params.sortBy ?? 'createdAt']: params.sortOrder ?? 'desc' },
        take: params.take,
        skip: params.skip
      }),
      prisma.user.count({ where })
    ])

    return { users, total }
  },

  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
  },

  findByUsername(username: string, excludeId?: string) {
    return prisma.user.findFirst({
      where: {
        username,
        isDeleted: false,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    })
  },

  create(data: { username: string; name: string; password: string }) {
    return prisma.user.create({
      data: { ...data, role: 'ADMIN' },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
  },

  update(
    id: string,
    data: { username: string; name: string; password?: string }
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        updatedAt: true
      }
    })
  },

  softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    })
  }
}
