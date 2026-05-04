import { prisma } from '../../prisma/client'
import { scraperService } from '../scraper/scraper.service'
import type { Redis } from 'ioredis'

const CACHE_TTL = 60 * 10 // 10 minutos

export const recruitersService = {

  async create(data: { name: string, linkedinUrl: string, userId: string }) {
    const existing = await prisma.recruiter.findUnique({
      where: { linkedinUrl: data.linkedinUrl }
    })
    if (existing) {
      throw new Error('Recrutador já cadastrado')
    }

    return prisma.recruiter.create({ data })
  },

  async findAll(userId: string) {
    return prisma.recruiter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { jobs: true } }
      }
    })
  },

  async delete(id: string, userId: string) {
    const recruiter = await prisma.recruiter.findUnique({ where: { id } })

    if (!recruiter) throw new Error('Recrutador não encontrado')
    if (recruiter.userId !== userId) throw new Error('Sem permissão')

    return prisma.recruiter.delete({ where: { id } })
  },

  async getJobs(recruiterId: string, userId: string, redis: Redis) {
    const recruiter = await prisma.recruiter.findUnique({ where: { id: recruiterId } })

    if (!recruiter) throw new Error('Recrutador não encontrado')
    if (recruiter.userId !== userId) throw new Error('Sem permissão')

    const cacheKey = `recruiter:${recruiterId}:jobs`
    const cached = await redis.get(cacheKey).catch(() => null)
    if (cached) {
      return { cached: true, jobs: JSON.parse(cached) }
    }

    const scrapedJobs = await scraperService.scrapeRecruiterJobs(recruiter.linkedinUrl)

    for (const job of scrapedJobs) {
      await prisma.recruiterJob.upsert({
        where: { url: job.url },
        update: {},
        create: {
          title: job.title,
          url: job.url,
          postedAt: new Date(job.postedAt),
          recruiterId
        }
      })
    }

    await redis.set(cacheKey, JSON.stringify(scrapedJobs), 'EX', CACHE_TTL).catch(() => null)

    return { cached: false, jobs: scrapedJobs }
  },

  async checkAllRecruiters() {
    const recruiters = await prisma.recruiter.findMany()
    console.log(`Verificando ${recruiters.length} recrutadores...`)

    for (const recruiter of recruiters) {
      try {
        const jobs = await scraperService.scrapeRecruiterJobs(recruiter.linkedinUrl)

        for (const job of jobs) {
          await prisma.recruiterJob.upsert({
            where: { url: job.url },
            update: {},
            create: {
              title: job.title,
              url: job.url,
              postedAt: new Date(job.postedAt),
              recruiterId: recruiter.id
            }
          })
        }

        console.log(`✅ ${recruiter.name}: ${jobs.length} vagas encontradas`)
      } catch (err) {
        console.error(`❌ Erro ao verificar ${recruiter.name}:`, err)
      }
    }
  }
}