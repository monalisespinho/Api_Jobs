import bcrypt from 'bcrypt'
import { prisma } from '../../prisma/client'

export const authService = {

  async register(email: string, password: string) {
    // Verifica se o email já existe
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new Error('Email já cadastrado')
    }

    // Gera o hash da senha — nunca salva senha pura
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    })

    return { id: user.id, email: user.email }
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new Error('Email ou senha inválidos')
    }

    // Compara a senha digitada com o hash salvo
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Email ou senha inválidos')
    }

    return { id: user.id, email: user.email }
  },

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, createdAt: true } // nunca retorna a senha
    })
    if (!user) throw new Error('Usuário não encontrado')
    return user
  }

}