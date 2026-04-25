import Fastify from 'fastify'
import { jwtPlugin } from './plugins/jwt'
import { redisPlugin } from './plugins/redis'
import { rateLimitPlugin } from './plugins/rate-limit'
import { authRoutes } from './modules/auth/auth.routes' 

const app = Fastify({
  logger: true // mostra logs no terminal
})

// Plugins
app.register(jwtPlugin)
app.register(redisPlugin)
app.register(rateLimitPlugin)
app.register(authRoutes)

// Rota de health check
app.get('/health', async () => {
  return { status: 'ok' }
})

// Inicia o servidor
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`Servidor rodando em http://localhost:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

export { app }