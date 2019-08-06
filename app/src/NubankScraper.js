import puppeteer from 'puppeteer'

async function run() {
  console.log('Started scraping')

  const browser = await puppeteer.launch({ headless: true })

  try {
    // start page
    const page = await browser.newPage()

    // go to nubank's log in page
    console.log('Going to Nubank')
    await page.goto('https://app.nubank.com.br/#/login')
    await page.screenshot({ path: '.screenshots/first-page.png' })
    console.log('Screenshot taken ".screenshots/first-page.png"')

    // type secret and submit
    console.log('Typing secrets')
    const { INPUT_USER, INPUT_PASS } = process.env
    await page.type('#username', INPUT_USER)
    await page.type('input[type="password"]', INPUT_PASS)
    await page.click('button[type="submit"]')
    console.log('Submited log in form')

    // wait for qr-code
    console.log('Waiting for qr code')
    await page.waitFor('.qr-code img')
    console.log('QR Code', await page.evaluate(() => { return document.querySelector('.qr-code img').src }))
    await page.screenshot({ path: '.screenshots/second-page.png' })
    console.log('Screenshot taken ".screenshots/second-page.png"')

    // log out from nubank
    console.log('Logging out')
    await page.click('a.logout')
    await page.waitFor(5000)
    await page.screenshot({ path: '.screenshots/logout-page.png' })

    browser && browser.close()
  } catch (e) {
    console.error(e)
    browser && browser.close()
  }
}