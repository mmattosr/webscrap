import puppeteer from 'puppeteer'
import randomUUID from 'uuid/v4'

const instances = {}

export async function createInstance(id) {
  const browser = await puppeteer.launch({ headless: true })
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
