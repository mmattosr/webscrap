import express from 'express'
import * as bodyParser from 'body-parser'
import errorHandler from './src/utils/errorHandlerMiddleware'
import nubank from './src/nubank/routes'

// init app
const app = express()

// set up body parser
app.use(bodyParser.json())

// set up nubank routes
nubank(app)

// set up static files
app.use('*', express.static(`${__dirname}/public`))

// set up error handler
app.use(errorHandler)

// run app
app.listen(8080, () => console.log('App started on http://localhost:8080'))
