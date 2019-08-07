import * as path from 'path'
import * as os from 'os'
import uuid from 'uuid/v4'
import puppeteer from 'puppeteer'

export const instances = {}

export default class NubankScraper {
  data = undefined
  initialized = false
  finished = false
  /** Puppeteer's instance id */
  id = undefined
  /** Puppeteer's browser instance */
  browser = undefined
  /** Puppeteer's page instance */
  page = undefined

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

  async exit() {
    console.log(`[${this.id}] Exiting`)

    // logout from nubank
    await this.printscreen('exiting')
    await this.page.evaluate(() => { document.querySelector('a.logout').click() })
    await this.page.waitFor(2000)
    await this.printscreen('exited')

    // // close browser instance
    // await this.browser.close()

    // // remove instance reference
    // instances[this.id] = undefined

    console.log(`[${this.id}] Exited`)
  }

  async printscreen(sufix) {
    const imgPath = path.resolve(os.tmpdir(), `${sufix}-${Date.now()}.png`)
    await this.page.screenshot({ path: imgPath })
    console.log(`[${this.id}] Screenshot taken ${imgPath}`)
  }
}

// scrapers
const scrapBillsPage = () => {
  const bills = [...document.querySelectorAll('.md-tab-content')].map(bill => {
    const [start, end] = bill.querySelectorAll('.charges .period span')
    const amount = bill.querySelector('.summary .amount')
    const due = bill.querySelector('.summary .due .date')
    const detail = bill.querySelector('.summary .detail')
    const charges = [...bill.querySelectorAll('.charges .charge')].map(charge => {
      const time = charge.querySelector('.time')
      const description = charge.querySelector('.description')
      const amount = charge.querySelector('.amount')
      return {
        time: time ? time.innerText : undefined,
        description: description ? description.innerText : undefined,
        amount: amount ? amount.innerText : undefined
      }
    })
    return {
      period: {
        start: start ? start.innerText : undefined,
        end: end ? end.innerText : undefined
      },
      amount: amount ? amount.innerText : undefined,
      due: due ? due.innerText : undefined,
      detail: detail ? detail.innerText : undefined,
      charges
    }
  })
  return bills
}
const scrapTransactionsPage = () => {
  // scrap available limit data
  let availableLimit = document.querySelector('.available .amount')
  availableLimit = availableLimit ? availableLimit.innerText : undefined

  // scrap feed data
  const feed = [...document.querySelectorAll('.transaction')].map(item => {
    const type = item.querySelector('.type')
    const title = item.querySelector('.title')
    const description = item.querySelector('.description')
    const amount = item.querySelector('.amount')
    const tags = item.querySelector('.tags')
    const time = item.querySelector('.time')
    return {
      type: type && type.innerText,
      title: title && title.innerText,
      description: description && description.innerText,
      amount: amount && amount.innerText,
      tags: tags && tags.innerText,
      time: time && time.innerText
    }
  })

  // scrap last transaction data
  let lastTransaction = document.querySelector('.last-transaction')
  if (lastTransaction) {
    let time = lastTransaction.querySelector('.time')
    time = time ? time.innerText : undefined
    let merchant = lastTransaction.querySelector('.merchant')
    merchant = merchant ? merchant.innerText : undefined
    let amount = lastTransaction.querySelector('.amount')
    amount = amount ? amount.innerText : undefined
    lastTransaction = {
      time,
      merchant,
      amount
    }
  }

  return {
    limitAvailable: availableLimit,
    lastTransaction,
    feed
  }
}
const scrapProfilePage = () => {
  const email = document.querySelector('#email')
  email = email ? email.value : undefined
  const phone = document.querySelector('#phone')
  phone = phone ? phone.value : undefined
  const totalLimit = document.querySelector('.card-summary .value')
  totalLimit = totalLimit ? totalLimit.innerText : undefined
  return {
    email,
    phone,
    totalLimit
  }
}