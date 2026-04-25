import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'

export const jwtPlugin = fp(async (app) => {
  app.register(jwt, {
    secret: process.env.JWT_SECRET || 'secret'
  })

  // Decorator para proteger rotas
  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.status(401).send({ error: 'Token inválido ou ausente' })
    }
  })
})