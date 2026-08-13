import { prisma } from '@/config/database'
import type { Prisma, QuizLevel, QuizQuestionType } from '@/generated/prisma/client'

export const quizRepository = {
  async findAll(params: {
    skip: number
    take: number
    level?: QuizLevel
    search?: string
  }) {
    const where: Prisma.QuizWhereInput = { isDeleted: false }
    if (params.level) where.level = params.level
    if (params.search) where.title = { contains: params.search }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        include: {
          _count: { select: { questions: { where: { isDeleted: false } } } }
        },
        orderBy: { createdAt: 'desc' },
        take: params.take,
        skip: params.skip
      }),
      prisma.quiz.count({ where })
    ])

    return { quizzes, total }
  },

  findById(id: string) {
    return prisma.quiz.findFirst({
      where: { id, isDeleted: false },
      include: {
        questions: {
          where: { isDeleted: false },
          orderBy: { order: 'asc' },
          include: {
            word: {
              select: {
                id: true,
                indonesian: true,
                localLanguage: true,
                localScript: true,
                audios: { where: { isDeleted: false }, take: 1, select: { url: true } }
              }
            }
          }
        }
      }
    })
  },

  create(data: { title: string; level: QuizLevel }) {
    return prisma.quiz.create({ data })
  },

  update(id: string, data: { title: string; level: QuizLevel }) {
    return prisma.quiz.update({ where: { id }, data })
  },

  softDelete(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.quizQuestion.updateMany({
        where: { quizId: id, isDeleted: false },
        data: { isDeleted: true, deletedAt: new Date() }
      })
      return tx.quiz.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() }
      })
    })
  },

  countQuestions(quizId: string) {
    return prisma.quizQuestion.count({ where: { quizId, isDeleted: false } })
  },

  createQuestion(data: {
    quizId: string
    wordId: string
    type: QuizQuestionType
    choices: string[]
    order: number
  }) {
    return prisma.quizQuestion.create({ data })
  },

  findQuestionById(id: string) {
    return prisma.quizQuestion.findFirst({
      where: { id, isDeleted: false },
      include: { word: { select: { id: true, indonesian: true, localLanguage: true, categoryId: true } } }
    })
  },

  softDeleteQuestion(id: string) {
    return prisma.quizQuestion.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    })
  },

  findWordById(id: string) {
    return prisma.word.findFirst({
      where: { id, isDeleted: false },
      include: { audios: { where: { isDeleted: false }, take: 1, select: { url: true } } }
    })
  },

  findRandomWordsInCategory(categoryId: string, excludeWordId: string, take: number) {
    return prisma.word.findMany({
      where: {
        categoryId,
        isDeleted: false,
        id: { not: excludeWordId }
      },
      select: { id: true, indonesian: true, localLanguage: true },
      take: take * 3
    })
  },

  findRandomWordsAnyCategory(excludeWordId: string, take: number) {
    return prisma.word.findMany({
      where: {
        isDeleted: false,
        id: { not: excludeWordId }
      },
      select: { id: true, indonesian: true, localLanguage: true },
      take: take * 3
    })
  }
}
