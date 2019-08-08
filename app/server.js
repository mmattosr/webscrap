import 'dotenv/config'

import './src/config/mongo'
import express from 'express'
import * as bodyParser from 'body-parser'
import errorHandler from './src/utils/middlewares/error-handler'
import nubank from './src/scrappers/nubank/routes'

// init app
const app = express()

// set up body parser
app.use(bodyParser.json())

// set up nubank scraper routes
nubank(app)

// set up static files
app.use('*', express.static(`${__dirname}/public`))

// set up error handler
app.use(errorHandler)

// run app
const port = process.env.PORT || 8080
app.listen(port, () => console.log(`App started on http://localhost:${port}`))
