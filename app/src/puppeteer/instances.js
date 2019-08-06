import puppeteer from 'puppeteer'

const instances = {}

export async function createInstance(id) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  instances[id] = browser
  console.log('Created instance', id)
  return browser
}

export async function getInstance(id) {
  if (instances[id]) {
    console.log('Retrived instance', id)
    return instances[id]
  } else {
    console.log('Can\'t find instance', id)
  }
}
