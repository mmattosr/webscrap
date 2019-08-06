import puppeteer from 'puppeteer'
// import uuid from 'uuid/v4'
// import { getInstance, createInstance } from '../puppeteer/instances'

// async function run() {
//   console.log('Started scraping')

//   const browser = await puppeteer.launch({ headless: true })

//   try {
//     // start page
//     const page = await browser.newPage()

//     // go to nubank's log in page
//     console.log('Going to Nubank')
//     await page.goto('https://app.nubank.com.br/#/login')
//     await page.screenshot({ path: '.screenshots/first-page.png' })
//     console.log('Screenshot taken ".screenshots/first-page.png"')

//     // type secret and submit
//     console.log('Typing secrets')
//     const { INPUT_USER, INPUT_PASS } = process.env
//     await page.type('#username', INPUT_USER)
//     await page.type('input[type="password"]', INPUT_PASS)
//     await page.click('button[type="submit"]')
//     console.log('Submited log in form')

//     // wait for qr-code
//     console.log('Waiting for qr code')
//     await page.waitFor('.qr-code img')
//     console.log('QR Code', await page.evaluate(() => { return document.querySelector('.qr-code img').src }))
//     await page.screenshot({ path: '.screenshots/second-page.png' })
//     console.log('Screenshot taken ".screenshots/second-page.png"')

//     // log out from nubank
//     console.log('Logging out')
//     await page.click('a.logout')
//     await page.waitFor(5000)
//     await page.screenshot({ path: '.screenshots/logout-page.png' })

//     browser && browser.close()
//   } catch (e) {
//     console.error(e)
//     browser && browser.close()
//   }
// }
const instances = {}

export default class NubankScraper {
  startPage = 'https://app.nubank.com.br/#/login'

  /** Puppeteer's instance id */
  id = undefined
  /** Puppeteer's browser instance */
  browser = undefined
  /** Puppeteer's page instance */
  page = undefined

  constructor(id) {
    if (instances[id]) {
      console.log(`[${id}] Retrieved scraper instance`)
      return instances[id]
    } else {
      this.id = id
      instances[id] = this
      console.log(`[${id}] Created scraper instance`)
    }
  }

  async init() {
    console.log(`[${this.id}] Initializing instance`)
    this.browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    this.page = await this.browser.newPage()

    // this.page.on('close', x => console.log('close', x))
    // this.page.on('console', x => console.log('console', x))
    // this.page.on('dialog', x => console.log('dialog', x))
    // this.page.on('domcontentloaded', x => console.log('domcontentloaded', x))
    // this.page.on('error', x => console.log('error', x))
    // this.page.on('frameattached', x => console.log('frameattached', x))
    // this.page.on('framedetached', x => console.log('framedetached', x))
    // this.page.on('framenavigated', x => console.log('framenavigated', x))
    // this.page.on('load', x => console.log('load', x))
    // this.page.on('metrics', x => console.log('metrics', x))
    // this.page.on('pageerror', x => console.log('pageerror', x))
    // this.page.on('popup', x => console.log('popup', x))
    // this.page.on('request', x => console.log('request', x))
    // this.page.on('requestfailed', x => console.log('requestfailed', x))
    // this.page.on('requestfinished', x => console.log('requestfinished', x))
    // this.page.on('response', x => console.log('response', x))
    // this.page.on('workercreated', x => console.log('workercreated', x))
    // this.page.on('workerdestroyed', x => console.log('workerdestroyed', x))

    await this.page.goto('https://app.nubank.com.br/#/login')
    await this.page.waitFor('#username')

    console.log(`[${this.id}] Initialized instance`)
  }

  /**
   * Type unsername and password then submit
   * 
   * @param {String} username 
   * @param {String} password
   * 
   * @returns qr code data source
   */
  async login(username, password) {
    console.log(`[${this.id}] Loging in`)
    await this.page.type('#username', username)
    await this.page.type('input[type="password"]', password)
    await this.page.click('button[type="submit"]')
    await this.page.waitFor('.qr-code img')
    await this.printscreen()
    const qrcode = await page.evaluate(() => { return document.querySelector('.qr-code img').src })
    console.log(`[${this.id}] Returning qr code`)
    return qrcode
  }

  async exit() {
    console.log(`[${this.id}] Exiting`)
    await this.page.click('a.logout')
    await this.browser.close()
    console.log(`[${this.id}] Exited`)
  }

  async printscreen() {
    await this.page.screenshot({ path: `.screenshots/${Date.now()}.png` })
  }
}