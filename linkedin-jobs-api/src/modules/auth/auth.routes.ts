import { FastifyInstance } from 'fastify'
import { authService } from './auth.service'
import { registerSchema, loginSchema } from './auth.schema'

export async function authRoutes(app: FastifyInstance) {

  // POST /auth/register
  app.post('/auth/register', { schema: registerSchema }, async (request, reply) => {
    const { email, password } = request.body as { email: string, password: string }

    try {
      const user = await authService.register(email, password)
      return reply.status(201).send(user)
    } catch (err: any) {
      return reply.status(400).send({ error: err.message })
    }
  })

  // POST /auth/login
  app.post('/auth/login', { schema: loginSchema }, async (request, reply) => {
    const { email, password } = request.body as { email: string, password: string }

    try {
      const user = await authService.login(email, password)

      // Gera o JWT com os dados do usuário
      const token = app.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      )

      return reply.send({ token })
    } catch (err: any) {
      return reply.status(401).send({ error: err.message })
    }
  })

  // GET /auth/me — rota protegida
  app.get('/auth/me', {
    onRequest: [app.authenticate]
  }, async (request, reply) => {
    const { userId } = request.user as { userId: string }

    try {
      const user = await authService.findById(userId)
      return reply.send(user)
    } catch (err: any) {
      return reply.status(404).send({ error: err.message })
    }
  })

}