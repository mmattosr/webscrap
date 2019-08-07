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

  async init() {
    // launch browser and page instances
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

    // navigate to nubank
    await this.page.goto('https://app.nubank.com.br/#/login')
    await this.page.waitFor(2000)
    this.initialized = true
    console.log(`[${this.id}] Initialized instance`)
  }

  async login(username, password) {
    console.log(`[${this.id}] Loging in`)
    // insert form data
    await this.page.type('#username', username)
    await this.page.type('input[type="password"]', password)
    // submit form
    await this.page.click('button[type="submit"]')
    await this.printscreen('typed')
    // wait for qr code load
    if (await this.waitFor(this.page.$('.qr-code img'), 'qrcode')) {
      console.log(`[${this.id}] Loged in`)
      // get qr code data
      const qrcode = await this.page.evaluate(() => { return document.querySelector('.qr-code img').src })
      // fires a async process to scrap nubank's app
      this.startScraping()
      // returns qr code
      console.log(`[${this.id}] Returning qr code`)
      return qrcode
    } else {
      // TODO: handle error message from page before return
      console.log(`[${this.id}] Can't log in`)
      throw new Error(`Can't log in`)
    }
  }

  async startScraping() {
    console.log(`[${this.id}] Starting data scrap`)
    // wait for authentication
    const authenticated = await this.waitFor(this.page.evaluate(() => { return window.location.href.includes('transactions') }), 'auth')
    // exit if auth failed
    if (!authenticated) {
      return await this.exit()
    }
    this.printscreen('transactions')
    console.log(`[${this.id}] Authenticated`)
    // scrap transactions data
    const transactions = await this.page.evaluate(scrapTransactionsPage)
    // go to bills page
    await this.page.goto('https://app.nubank.com.br/#/bills')
    await this.page.waitFor(2000)
    this.printscreen('bills')
    // scrap bills data
    const bills = await this.page.evaluate(scrapBillsPage)
    // go to profile page
    await this.page.goto('https://app.nubank.com.br/#/profile')
    await this.page.waitFor(2000)
    this.printscreen('profile')
    // scrap profile data
    const profile = await this.page.evaluate(scrapProfilePage)

    this.finished = true
    this.data = {
      transactions,
      bills,
      profile
    }


    // TODO: persist data
    // exit
    // await this.exit()
  }

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
      return true
    } catch (e) {
      this.printscreen('cantlogin')
      console.log(`[${this.id}] Timed out waiting for ${name} `)
      return false
    }
  }

  async exit() {
    this.prepare()
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
  // https://app.nubank.com.br/#/bills

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
  // https://app.nubank.com.br/#/profile
  const email = document.querySelector('#email')
  email = email ? email.value : undefined
  const phone = document.querySelector('#phone')
  phone = phone ? phone.value : undefined
  const totalLimit = document.querySelector('.card-summary .value')
  totalLimit = totalLimit ? totalLimit.innerText : undefined
}