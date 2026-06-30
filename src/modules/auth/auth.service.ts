import { prisma } from '@/config/database'
import { authRepository } from './auth.repository'
import { comparePassword, hashPassword } from '@/utils/password'
import { signAccessToken } from '@/utils/jwt'
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException
} from '@/exceptions'
import type { LoginInput, ChangePasswordInput } from './auth.schema'
import type { TokenPayload } from '@/utils/jwt'

export const authService = {
  async login(input: LoginInput) {
    const user = await authRepository.findByUsername(input.username)

    if (!user) {
      throw new UnauthorizedException('Username atau password salah')
    }

    const valid = await comparePassword(input.password, user.password)
    if (!valid) {
      throw new UnauthorizedException('Username atau password salah')
    }

    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }

    const token = signAccessToken(payload)

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    }
  },

  async getMe(userId: string) {
    const user = await authRepository.findById(userId)
    if (!user) {
      throw new NotFoundException('User')
    }
    return user
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User')
    }

    const valid = await comparePassword(input.currentPassword, user.password)
    if (!valid) {
      throw new BadRequestException('Password saat ini tidak benar')
    }

    const hashed = await hashPassword(input.newPassword)
    await authRepository.updatePassword(userId, hashed)

    return true
  }
}
