import { FastifyInstance } from 'fastify'
import { jobsService } from './jobs.service'
import { searchJobsSchema } from './jobs.schema'

export async function jobsRoutes(app: FastifyInstance) {

  // GET /jobs/search
  app.get('/jobs/search', {
  
  })

  // GET /jobs/history
  app.get('/jobs/history', {


}