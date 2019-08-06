import 'dotenv/config'
import express from 'express'
import uuid from 'uuid/v4'
import { createInstance, getInstance } from './puppeteer/instances'

const app = express()

app.get('/:uuid', async (req, res) => {
  const id = req.params.uuid
  await getInstance(id)
  res.send(id)
})

app.get('/', async (req, res) => {
  const id = uuid()
  await createInstance(id)
  res.redirect(`/${id}`)
})

app.listen(8080, () => console.log('App started on http://localhost8080'))
