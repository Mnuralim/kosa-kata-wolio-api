import { syncRepository } from './sync.repository'
import type { SyncQuery } from './sync.schema'

export const syncService = {
  async getWords(query: SyncQuery) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1)
    const limit = Math.min(200, Math.max(1, parseInt(query.limit ?? '50', 10) || 50))
    const skip = (page - 1) * limit

    const updatedAfter = query.updatedAfter
      ? new Date(query.updatedAfter)
      : undefined

    const { words, total } = await syncRepository.findAllWords({
      skip,
      take: limit,
      updatedAfter
    })

    return {
      data: words,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  async getCategories(query: SyncQuery) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1)
    const limit = Math.min(200, Math.max(1, parseInt(query.limit ?? '50', 10) || 50))
    const skip = (page - 1) * limit

    const updatedAfter = query.updatedAfter
      ? new Date(query.updatedAfter)
      : undefined

    const { categories, total } = await syncRepository.findAllCategories({
      skip,
      take: limit,
      updatedAfter
    })

    return {
      data: categories,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  async getSyncVersion() {
    return syncRepository.getSyncVersion()
  }
}
