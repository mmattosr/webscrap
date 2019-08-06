import 'dotenv/config'
import express from 'express'
import uuid from 'uuid/v4'
import { createInstance, getInstance } from './src/puppeteer/instances'

const app = express()


app.get('/instance/:uuid', async (req, res) => {
  const id = req.params.uuid
  await getInstance(id)
  res.send(id)
})

app.post('/instance', async (req, res) => {
  const id = uuid()
  await createInstance(id)
  res.send(id)
})

app.use('*', express.static(`${__dirname}/public`))

app.listen(8080, () => console.log('App started on http://localhost:8080'))
