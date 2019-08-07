import 'dotenv/config'
import express from 'express'
import * as bodyParser from 'body-parser'
import NubankScraper, { instances } from './src/scrapers/NubankScraper'

const app = express()

app.use(bodyParser.json())

app.get('/nubank/instances', async (req, res) => {
  try {
    res.send({ instances: instances && Object.keys(instances) })
  } catch (error) {
    console.error(error.stack)
    res.status(500)
    res.send({
      error: {
        message: error.message
      }
    })
  }
})

app.post('/nubank', async (req, res) => {
  try {
    // init nubank's scraper instance
    const instance = new NubankScraper()
    await instance.init()
    res.send({ id: instance.id })
  } catch (error) {
    console.error(error.stack)
    res.status(500)
    res.send({
      error: {
        message: error.message
      }
    })
  }
})

app.post('/nubank/:id/login', async (req, res) => {
  try {
    // check if instance id is defined
    if (!req.params.id || !req.body.username || !req.body.password) {
      res.status(400)
      res.send({
        error: {
          message: 'Missing parameters',
          parameters: {
            id: req.params.id,
            username: req.body.username,
            password: req.body.password
          }
        }
      })
      return
    }
    const scraper = new NubankScraper(req.params.id)
    // TODO: post password with hash
    const qrcode = await scraper.login(req.body.username, req.body.password)
    res.send({ qrcode })
  } catch (error) {
    console.error(error.stack)
    res.status(500)
    res.send({
      error: {
        message: error.message
      }
    })
  }
})

app.get('/nubank/:id/data', async (req, res) => {
  try {
    // check if instance id is defined
    if (!req.params.id) {
      res.status(400)
      res.send({
        error: {
          message: 'Missing parameters',
          parameters: {
            id: req.params.id
          }
        }
      })
      return
    }
    const scraper = new NubankScraper(req.params.id)
    const data = scraper.getData()
    if (!data || (data && Object.values(data).every(v => !v))) {
      res.status(200)
      res.send({ data })
    } else {
      res.status(400)
      res.send({
        error: {
          message: 'There is no data available',
        }
      })
    }
  } catch (error) {
    console.error(error.stack)
    res.status(500)
    res.send({
      error: {
        message: error.message
      }
    })
  }
})

app.post('/nubank/:id/exit', async (req, res) => {
  try {
    // check if instance id is defined
    if (!req.params.id) {
      res.status(400)
      res.send({
        error: {
          message: 'Missing parameters',
          parameters: {
            id: req.params.id
          }
        }
      })
      return
    }
    const scraper = new NubankScraper(req.params.id)
    await scraper.exit()
    res.status(200)
    res.end()
  } catch (error) {
    console.error(error.stack)
    res.status(500)
    res.send({
      error: {
        message: error.message
      }
    })
  }
})

app.use('*', express.static(`${__dirname}/public`))

app.listen(8080, () => console.log('App started on http://localhost:8080'))
