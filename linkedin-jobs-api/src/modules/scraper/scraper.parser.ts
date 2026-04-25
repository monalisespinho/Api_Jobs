export interface Job {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  url: string
  postedAt: string
}

export function parseJobs(cards: Element[]): Job[] {
  return cards.map(card => {
    const id = card.getAttribute('data-job-id') || ''
    const title = card.querySelector('.job-card-list__title')?.textContent?.trim() || ''
    const company = card.querySelector('.job-card-container__company-name')?.textContent?.trim() || ''
    const location = card.querySelector('.job-card-container__metadata-item')?.textContent?.trim() || ''
    const url = `https://www.linkedin.com/jobs/view/${id}`
    const remote = location.toLowerCase().includes('remoto') || location.toLowerCase().includes('remote')

    return { id, title, company, location, remote, url, postedAt: new Date().toISOString() }
  }).filter(job => job.id && job.title) // remove cards sem dados
}