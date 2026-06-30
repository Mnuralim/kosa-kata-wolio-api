import { categoriesRepository } from './categories.repository'
import {
  NotFoundException,
  ConflictException,
  BadRequestException
} from '@/exceptions'
import type { CreateCategoryInput, UpdateCategoryInput } from './categories.schema'

export const categoriesService = {
  async list(query: {
    page?: string
    limit?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '10', 10) || 10))
    const skip = (page - 1) * limit

    const { categories, total } = await categoriesRepository.findAll({
      skip,
      take: limit,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: (query.sortOrder as 'asc' | 'desc') ?? 'desc'
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

  async listSimple() {
    return categoriesRepository.findAllSimple()
  },

  async getById(id: string) {
    const category = await categoriesRepository.findById(id)
    if (!category) throw new NotFoundException('Kategori')
    return category
  },

  async create(input: CreateCategoryInput) {
    const name = input.name.trim()
    const existing = await categoriesRepository.findByName(name)
    if (existing) {
      throw new ConflictException('Kategori sudah ada')
    }
    return categoriesRepository.create(name)
  },

  async update(id: string, input: UpdateCategoryInput) {
    const name = input.name.trim()
    const existing = await categoriesRepository.findByName(name, id)
    if (existing) {
      throw new ConflictException('Nama kategori sudah digunakan')
    }
    return categoriesRepository.update(id, name)
  },

  async delete(id: string) {
    const category = await categoriesRepository.findById(id)
    if (!category) throw new NotFoundException('Kategori')

    const wordCount = await categoriesRepository.countWords(id)
    if (wordCount > 0) {
      throw new BadRequestException('Kategori masih digunakan oleh data kata')
    }

    await categoriesRepository.softDelete(id)
    return true
  }
}
