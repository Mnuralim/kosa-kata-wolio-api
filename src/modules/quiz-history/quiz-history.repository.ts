import { prisma } from '@/config/database'
import type { Prisma } from '@/generated/prisma/client'

export const quizHistoryRepository = {
  findByUser(userId: string, params: { skip: number; take: number }) {
    return Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { finishedAt: 'desc' },
        skip: params.skip,
        take: params.take,
        include: { quiz: { select: { id: true, title: true, level: true } } }
      }),
      prisma.quizAttempt.count({ where: { userId } })
    ])
  },

  findAll(params: { skip: number; take: number; userId?: string; quizId?: string }) {
    const where: Prisma.QuizAttemptWhereInput = {}
    if (params.userId) where.userId = params.userId
    if (params.quizId) where.quizId = params.quizId

    return Promise.all([
      prisma.quizAttempt.findMany({
        where,
        orderBy: { finishedAt: 'desc' },
        skip: params.skip,
        take: params.take,
        include: {
          quiz: { select: { id: true, title: true, level: true } },
          user: { select: { id: true, username: true, name: true } }
        }
      }),
      prisma.quizAttempt.count({ where })
    ])
  },

  findDetailById(id: string) {
    return prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        quiz: { select: { id: true, title: true, level: true } },
        user: { select: { id: true, username: true, name: true } },
        answers: {
          orderBy: { answeredAt: 'asc' },
          include: {
            question: {
              include: {
                word: {
                  select: { id: true, indonesian: true, localLanguage: true, localScript: true }
                }
              }
            }
          }
        }
      }
    })
  }
}
