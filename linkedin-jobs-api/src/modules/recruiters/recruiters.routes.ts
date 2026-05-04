import { FastifyInstance } from 'fastify'
import { recruitersService } from './recruiters.service'
import { createRecruiterSchema } from './recruiters.schema'

export async function recruitersRoutes(app: FastifyInstance) {

  // POST /recruiters
  app.post('/recruiters', {
    
  })

  // GET /recruiters
  app.get('/recruiters', {
    
  })

  // DELETE /recruiters/:id
  app.delete('/recruiters/:id', {
   
  })

  // GET /recruiters/:id/jobs
  app.get('/recruiters/:id/jobs', {
    
  })
}