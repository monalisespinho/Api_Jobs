import { prisma } from '../../prisma/client'
import { scraperService } from '../scraper/scraper.service'
import type { Redis } from 'ioredis'

const CACHE_TTL = 60 * 30 // 30 minutos em segundos

export const jobsService = {

  async search(params: {
    keyword: string
    location?: string
    remote?: boolean
    limit?: number
    userId: string
    redis: Redis
  }) {
    const { keyword, location, remote, limit = 10, userId, redis } = params

    // Monta a chave de cache
    const cacheKey = `jobs:${keyword}:${location || 'all'}:${remote}:${limit}`

    // Verifica se tem no cache
    const cached = await redis.get(cacheKey).catch(() => null)
    if (cached) {
      return { cached: true, jobs: JSON.parse(cached) }
    }

    // Não tem cache — busca no LinkedIn
    const jobs = await scraperService.searchJobs({ keyword, location, remote, limit })

    // Salva no cache
    await redis.set(cacheKey, JSON.stringify(jobs), 'EX', CACHE_TTL).catch(() => null)

    // Salva no histórico do usuário
    await prisma.search.create({
      data: { keyword, location, userId }
    }).catch(() => null)

    return { cached: false, jobs }
  },

  async getHistory(userId: string) {
    return prisma.search.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
  }

}