import MissingParametersError from '../utils/errors/MissingParametersError'

export default function routes(app) {
  // POST /nubank
  app.post('/nubank', async (req, res) => {
    const instance = new NubankScraper()
    await instance.init()
    res.send({ id: instance.id })
  })

  // POST /nubank/:id/login
  app.post('/nubank/:id/login', async (req, res) => {
    if (!req.params.id || !req.body.username || !req.body.password) {
      throw new MissingParametersError({
        id: req.params.id,
        username: req.body.username,
        password: req.body.password
      })
    }
    const scraper = new NubankScraper(req.params.id)
    const qrcode = await scraper.login(req.body.username, req.body.password)
    res.send({ qrcode })
  })

  // GET /nubank/:id/data
  app.get('/nubank/:id/data', async (req, res) => {
    if (!req.params.id) {
      throw new MissingParametersError({ id: req.params.id })
    }
    const scraper = new NubankScraper(req.params.id)
    const data = scraper.getData()
    res.send({ data })
  })

  // POST /nubank/:id/exit
  app.post('/nubank/:id/exit', async (req, res) => {
    if (!req.params.id) {
      throw new MissingParametersError({ id: req.params.id })
    }
    const scraper = new NubankScraper(req.params.id)
    await scraper.exit()
    res.status(200)
    res.end()
  })
}