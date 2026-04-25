import { chromium } from 'playwright'

export interface SearchParams {
  keyword: string
  location?: string
  remote?: boolean
  limit?: number
}

export const scraperService = {

  // Busca vagas por keyword
  async searchJobs(params: SearchParams) {
    const { keyword, location = '', remote = false, limit = 10 } = params

    const browser = await chromium.launch({
      headless: process.env.SCRAPER_HEADLESS !== 'false'
    })

    try {
      const page = await browser.newPage()

      // Monta a URL de busca
      const url = new URL('https://www.linkedin.com/jobs/search')
      url.searchParams.set('keywords', keyword)
      if (location) url.searchParams.set('location', location)
      if (remote) url.searchParams.set('f_WT', '2') // filtro de remoto do LinkedIn

      await page.goto(url.toString(), {
        waitUntil: 'networkidle',
        timeout: Number(process.env.SCRAPER_TIMEOUT) || 30000
      })

      // Espera os cards de vaga carregarem
      await page.waitForSelector('.job-card-container', { timeout: 10000 })
        .catch(() => null) // se não achar, continua com array vazio

      // Extrai os dados diretamente no contexto do navegador
      const jobs = await page.$$eval('.job-card-container', (cards, lim) => {
        return cards.slice(0, lim).map(card => {
          const id = card.getAttribute('data-job-id') || ''
          const title = card.querySelector('.job-card-list__title')?.textContent?.trim() || ''
          const company = card.querySelector('.job-card-container__company-name')?.textContent?.trim() || ''
          const location = card.querySelector('.job-card-container__metadata-item')?.textContent?.trim() || ''
          const url = `https://www.linkedin.com/jobs/view/${id}`
          const remote = location.toLowerCase().includes('remoto') || location.toLowerCase().includes('remote')

          return { id, title, company, location, remote, url, postedAt: new Date().toISOString() }
        }).filter((job: any) => job.id && job.title)
      }, limit)

      return jobs

    } finally {
      await browser.close() // sempre fecha o browser, mesmo em caso de erro
    }
  },

  // Busca vagas no perfil público de um recrutador
  async scrapeRecruiterJobs(linkedinUrl: string) {
    const browser = await chromium.launch({
      headless: process.env.SCRAPER_HEADLESS !== 'false'
    })

    try {
      const page = await browser.newPage()

      // Acessa a aba de atividades públicas do recrutador
      const activityUrl = `${linkedinUrl}/recent-activity/shares/`
      await page.goto(activityUrl, {
        waitUntil: 'networkidle',
        timeout: Number(process.env.SCRAPER_TIMEOUT) || 30000
      })

      await page.waitForSelector('.feed-shared-update-v2', { timeout: 10000 })
        .catch(() => null)

      // Extrai apenas posts que parecem vagas
      const jobs = await page.$$eval('.feed-shared-update-v2', (posts) => {
        const vagaKeywords = ['vaga', 'oportunidade', 'hiring', 'contratando', 'job', 'posição', 'aberta']

        return posts
          .map(post => {
            const text = post.textContent?.toLowerCase() || ''
            const url = post.querySelector('a')?.href || ''
            const title = post.textContent?.trim().slice(0, 80) || '' // primeiros 80 caracteres como título

            return { title, url, postedAt: new Date().toISOString(), isJob: vagaKeywords.some(k => text.includes(k)) }
          })
          .filter(post => post.isJob && post.url) // só posts que parecem vagas
          .map(({ title, url, postedAt }) => ({ title, url, postedAt }))
      })

      return jobs

    } finally {
      await browser.close()
    }
  }

}