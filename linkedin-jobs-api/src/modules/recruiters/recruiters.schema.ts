export const createRecruiterSchema = {
  body: {
    type: 'object',
    required: ['name', 'linkedinUrl'],
    properties: {
      name:        { type: 'string', minLength: 2 },
      linkedinUrl: { type: 'string', pattern: 'linkedin.com/in/' }
    }
  }
}