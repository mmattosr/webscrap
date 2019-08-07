import * as path from 'path'
import * as os from 'os'
import uuid from 'uuid/v4'
import puppeteer from 'puppeteer'
import scrapBillsPage from './scrappers/scrapBillsPage'
import scrapTransactionsPage from './scrappers/scrapTransactionsPage'
import scrapProfilePage from './scrappers/scrapProfilePage'

// hold scrapper instances
export const instances = {}

export default class NubankScrapper {
  id = undefined
  browser = undefined
  page = undefined
  data = undefined
  initialized = false
  finished = false

  constructor(id) {
    // create instance
    if (id === undefined) {
      this.id = uuid()
      console.log(`[${this.id}] Created scraper instance`)
      instances[this.id] = this
    }
    // retrieve instance
    else if (instances[id]) {
      console.log(`[${id}] Retrieved scraper instance`)
      return instances[id]
    }
    // missing instance
    else {
      throw new Error(`Missing instance ${id}`)
    }
  }

  /**
   * Init puppeteer's browser and page instances
   */
  async init() {
    // launch browser and page instances
    console.log(`[${this.id}] Initializing instance`)
    this.browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    this.page = await this.browser.newPage()
    this.initialized = true
    console.log(`[${this.id}] Initialized instance`)
  }

  /**
   * Do login. If a qrcode is found then return it source, else throw a error.
   * 
   * @param username 
   * @param password 
   */
  async login(username, password) {
    try {
      console.log(`[${this.id}] Going to login page`)

      // navigate to nubank
      await this.page.goto('https://app.nubank.com.br/#/login')
      await this.waitForLocation('login')

      console.log(`[${this.id}] Loging in`)

      // insert form data
      await this.page.type('#username', username)
      await this.page.type('input[type="password"]', password)

      // submit form
      await this.page.click('button[type="submit"]')
      await this.printscreen('typed')

      // wait for qrcode load
      await this.waitForSelector('.qr-code img')

      console.log(`[${this.id}] Loged in`)

      // get qr code data
      const qrcode = await this.page.evaluate(() => { return document.querySelector('.qr-code img').src })

      // fires a async process to scrap nubank's app
      this.startScraping()

      console.log(`[${this.id}] Returning qr code`)

      // returns qr code
      return qrcode
    } catch (error) {
      if (error.message.includes(this.id)) {
        console.log(error.message)
      }
      throw error
    }
  }

  /**
   * Await until user scan qr code, then start scrap process.
   * At the end set finished flag to true.
   */
  async startScraping() {
    try {
      console.log(`[${this.id}] Starting data scrap`)

      // wait for transactions page
      // ps: await a lot because user needs to scans qr code
      const authenticated = await this.waitForLocation('transactions', 'transactions', 6)

      // exit if auth failed
      if (!authenticated) return await this.exit()

      console.log(`[${this.id}] Authenticated`)

      // scrap transactions data
      await this.printscreen('transactions')
      const transactions = await this.page.evaluate(scrapTransactionsPage)

      // go to bills page and scrap it
      await this.page.goto('https://app.nubank.com.br/#/bills')
      await this.waitForLocation('bills')
      await this.printscreen('bills')
      const bills = await this.page.evaluate(scrapBillsPage)

      // go to profile page and scrap it
      await this.page.goto('https://app.nubank.com.br/#/profile')
      await this.waitForLocation('profile')
      await this.printscreen('profile')
      const profile = await this.page.evaluate(scrapProfilePage)

      // set instance data
      this.finished = true
      this.data = {
        transactions,
        bills,
        profile
      }
    } catch (error) {
      if (error.message.includes(this.id)) {
        console.log(error.message)
      }
    }
  }

  /**
   * Returns scraped data if process is finished
   */
  getData() {
    if (this.finished) {
      return this.data
    }
  }

  /**
   * Await for some condition.
   * 
   * @param condition function
   * @param times to check for condition
   * @param name 
   */
  async waitFor(condition, name = 'something', times = 3) {
    // loop count
    let count = 1
    // condition loop
    const loop = exit => {
      return exit === true
        ? true
        : new Promise((resolve, reject) => {
          console.log(`[${this.id}] Waiting for ${name}`)
          setTimeout(async () => {
            // check if condition resolves to true
            const result = await condition
            console.log(`[${this.id}] Waiting for ${name} result:`, result)
            if (Boolean(result)) {
              resolve(true)
            }
            // reject if loop reached its limit
            else if (count === times) {
              reject()
            }
            // keep loop running
            else {
              count++
              resolve(loop(false))
            }
          }, 2000)
        })
    }
    try {
      await loop()
    } catch (e) {
      await this.printscreen(`timeout-${name}`)
      throw new Error(`[${this.id}] Timed out waiting for ${name}`)
    }
  }

  /**
   * Wait for window.location.href to includes param location.
   * 
   * @param location 
   * @param name 
   * @param times 
   */
  waitForLocation(location, name, times) {
    const condition = this.page.evaluate(() => { return window.location.href.includes(location) })
    return this.waitFor(condition, name || location, times)
  }

  /**
   * Wait for selector.
   * 
   * @param selector 
   * @param name 
   * @param times 
   */
  waitForSelector(selector, name, times) {
    const condition = this.page.$(selector)
    return this.waitFor(condition, name || selector, times)
  }

  /**
   * Log out from nubank and close browser.
   */
  async exit() {
    console.log(`[${this.id}] Exiting`)

    // logout from nubank
    await this.printscreen('exiting')
    await this.page.evaluate(() => { document.querySelector('a.logout').click() })
    await this.page.waitFor(2000)
    await this.printscreen('exited')

    // close browser instance
    await this.browser.close()

    // remove instance reference
    instances[this.id] = undefined

    console.log(`[${this.id}] Exited`)
  }

  async printscreen(sufix) {
    const imgPath = path.resolve(os.tmpdir(), `${sufix}-${Date.now()}.png`)
    await this.page.screenshot({ path: imgPath })
    console.log(`[${this.id}] Screenshot taken ${imgPath}`)
  }
}
