import fp from 'fastify-plugin'
import Redis from 'ioredis'

export const redisPlugin = fp(async (app) => {
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

  redis.on('connect', () => console.log('Redis conectado'))
  redis.on('error', (err) => console.error('Erro no Redis:', err))

  // Disponibiliza o redis em toda a aplicação
  app.decorate('redis', redis)

  // Fecha a conexão quando o servidor encerrar
  app.addHook('onClose', async () => {
    await redis.quit()
  })
})