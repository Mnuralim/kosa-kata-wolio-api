import { prisma } from '@/config/database'

export const authRepository = {
  findByUsername(username: string) {
    return prisma.user.findFirst({
      where: { username, isDeleted: false }
    })
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

  updatePassword(id: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })
  }
}
