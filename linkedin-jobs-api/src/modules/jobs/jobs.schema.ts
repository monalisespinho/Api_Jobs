export const searchJobsSchema = {
  querystring: {
    type: 'object',
    required: ['keyword'],
    properties: {
      keyword:  { type: 'string', minLength: 1 },
      location: { type: 'string' },
      remote:   { type: 'boolean' },
      limit:    { type: 'number', minimum: 1, maximum: 50 }
    }
  }
}