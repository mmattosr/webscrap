import 'dotenv/config'
import express from 'express'
import uuid from 'uuid/v4'
import * as bodyParser from 'body-parser'
import NubankScraper from './src/scrapers/NubankScraper'

const app = express()

app.use(bodyParser.json())

app.post('/nubank', async (req, res) => {
  try {
    // init nubank's scraper instance
    const scraper = new NubankScraper(uuid())
    await scraper.init()
    res.send({ id: scraper.id })
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
    const scraper = new NubankScraper(uuid())
    const qrcode = await scraper.login()
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
    const scraper = new NubankScraper(uuid())
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
