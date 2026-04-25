import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'

export const rateLimitPlugin = fp(async (app) => {
  app.register(rateLimit, {
    max: 100,        // máximo de requisições
    timeWindow: '1 minute'
  })
})