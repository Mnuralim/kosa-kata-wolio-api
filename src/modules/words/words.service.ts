import { wordsRepository } from './words.repository'
import { categoriesRepository } from '../categories/categories.repository'
import {
  NotFoundException,
  ConflictException,
  BadRequestException
} from '@/exceptions'
import type {
  CreateWordInput,
  UpdateWordInput,
  AddAudioInput,
  ReplaceAudioInput
} from './words.schema'

export const wordsService = {
  async list(query: {
    page?: string
    limit?: string
    search?: string
    categoryId?: string
    hasAudio?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '10', 10) || 10))
    const skip = (page - 1) * limit

    const { words, total } = await wordsRepository.findAll({
      skip,
      take: limit,
      search: query.search,
      categoryId: query.categoryId,
      hasAudio: query.hasAudio,
      sortBy: query.sortBy,
      sortOrder: (query.sortOrder as 'asc' | 'desc') ?? 'desc'
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

  async getById(id: string) {
    const word = await wordsRepository.findById(id)
    if (!word) throw new NotFoundException('Kata')
    return word
  },

  async create(input: CreateWordInput) {
    // Validasi kategori
    const category = await categoriesRepository.findById(input.categoryId)
    if (!category) throw new NotFoundException('Kategori')

    // Cek duplikat
    const existing = await wordsRepository.findDuplicate(
      input.indonesian.trim(),
      input.localLanguage.trim(),
      input.categoryId
    )
    if (existing) {
      throw new ConflictException('Kata sudah ada pada kategori ini')
    }

    return wordsRepository.create({
      indonesian: input.indonesian.trim(),
      localLanguage: input.localLanguage.trim(),
      localScript: input.localScript?.trim() || null,
      categoryId: input.categoryId,
      audioUrls: input.audioUrls ?? []
    })
  },

  async update(id: string, input: UpdateWordInput) {
    const word = await wordsRepository.findById(id)
    if (!word) throw new NotFoundException('Kata')

    const category = await categoriesRepository.findById(input.categoryId)
    if (!category) throw new NotFoundException('Kategori')

    const existing = await wordsRepository.findDuplicate(
      input.indonesian.trim(),
      input.localLanguage.trim(),
      input.categoryId,
      id
    )
    if (existing) {
      throw new ConflictException('Kata sudah ada pada kategori ini')
    }

    // Update data kata
    const updated = await wordsRepository.update(id, {
      indonesian: input.indonesian.trim(),
      localLanguage: input.localLanguage.trim(),
      localScript: input.localScript?.trim() || null,
      categoryId: input.categoryId
    })

    // Replace audio jika audioUrls dikirim
    if (input.audioUrls !== undefined) {
      await wordsRepository.replaceAudiosBulk(id, input.audioUrls)
    }

    // Return data terbaru
    return wordsRepository.findById(id)
  },

  async updateLocalScript(id: string, localScript: string | null) {
    const word = await wordsRepository.findById(id)
    if (!word) throw new NotFoundException('Kata')

    return wordsRepository.updateLocalScript(id, localScript?.trim() || null)
  },

  async delete(id: string) {
    const word = await wordsRepository.findById(id)
    if (!word) throw new NotFoundException('Kata')

    await wordsRepository.softDelete(id)
    return true
  },

  // Audio operations
  async addAudio(wordId: string, url: string) {
    const word = await wordsRepository.findById(wordId)
    if (!word) throw new NotFoundException('Kata')

    return wordsRepository.addAudio(wordId, url.trim())
  },

  async deleteAudio(audioId: string) {
    const audio = await wordsRepository.findAudioById(audioId)
    if (!audio) throw new NotFoundException('Audio')

    await wordsRepository.deleteAudio(audioId)
    return true
  },

  async replaceAudio(wordId: string, url: string) {
    const word = await wordsRepository.findById(wordId)
    if (!word) throw new NotFoundException('Kata')

    return wordsRepository.replaceAudio(wordId, url.trim())
  },

  // Dashboard
  async getStats() {
    return wordsRepository.getStats()
  }
}
