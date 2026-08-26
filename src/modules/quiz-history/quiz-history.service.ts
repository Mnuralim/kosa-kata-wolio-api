import { quizHistoryRepository } from './quiz-history.repository'
import { NotFoundException, ForbiddenException } from '@/exceptions'

function parsePagination(query: { page?: string; limit?: string }) {
  const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '10', 10) || 10))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export const quizHistoryService = {
  async listMine(userId: string, query: { page?: string; limit?: string }) {
    const { page, limit, skip } = parsePagination(query)
    const [attempts, total] = await quizHistoryRepository.findByUser(userId, { skip, take: limit })
    return { data: attempts, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async getMine(userId: string, attemptId: string) {
    const attempt = await quizHistoryRepository.findDetailById(attemptId)
    if (!attempt) throw new NotFoundException('Riwayat kuis')
    if (attempt.userId !== userId) throw new ForbiddenException()
    return attempt
  },

  async listAll(query: { page?: string; limit?: string; userId?: string; quizId?: string }) {
    const { page, limit, skip } = parsePagination(query)
    const [attempts, total] = await quizHistoryRepository.findAll({
      skip,
      take: limit,
      userId: query.userId,
      quizId: query.quizId
    })
    return { data: attempts, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async getById(attemptId: string) {
    const attempt = await quizHistoryRepository.findDetailById(attemptId)
    if (!attempt) throw new NotFoundException('Riwayat kuis')
    return attempt
  }
}
