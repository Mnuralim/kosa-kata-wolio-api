import { usersRepository } from './users.repository'
import { hashPassword } from '@/utils/password'
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException
} from '@/exceptions'
import type { CreateUserInput, UpdateUserInput } from './users.schema'
import type { TokenPayload } from '@/utils/jwt'

export const usersService = {
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

    const { users, total } = await usersRepository.findAll({
      skip,
      take: limit,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: (query.sortOrder as 'asc' | 'desc') ?? 'desc'
    })

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  async getById(id: string) {
    const user = await usersRepository.findById(id)
    if (!user) throw new NotFoundException('User')
    return user
  },

  async create(input: CreateUserInput, actor: TokenPayload) {
    const existing = await usersRepository.findByUsername(input.username)
    if (existing) {
      throw new ConflictException('Username sudah digunakan')
    }

    const password = input.password?.trim() || '123456'
    const hashed = await hashPassword(password)

    return usersRepository.create({
      username: input.username.trim(),
      name: input.name.trim(),
      password: hashed
    })
  },

  async update(id: string, input: UpdateUserInput, actor: TokenPayload) {
    const user = await usersRepository.findById(id)
    if (!user) throw new NotFoundException('User')

    const existing = await usersRepository.findByUsername(input.username, id)
    if (existing) {
      throw new ConflictException('Username sudah digunakan')
    }

    const data: { username: string; name: string; password?: string } = {
      username: input.username.trim(),
      name: input.name.trim()
    }

    if (input.password && input.password.trim().length > 0) {
      data.password = await hashPassword(input.password.trim())
    }

    return usersRepository.update(id, data)
  },

  async delete(id: string, actor: TokenPayload) {
    if (actor.sub === id) {
      throw new BadRequestException('Tidak bisa menghapus akun sendiri')
    }

    const user = await usersRepository.findById(id)
    if (!user) throw new NotFoundException('User')

    await usersRepository.softDelete(id)
    return true
  }
}
