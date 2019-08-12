/**
 * Method used inside transactions page to scrap data.
 * This function scrap these infos:
 * - limitAvailable
 * - lastTransaction
 *  - time
 *  - merchant
 *  - amount
 * - feed
 *  - type
 *  - title
 *  - description
 *  - amout
 *  - tags
 *  - time
 * 
 * Obs.: To prevent transpiler issues all scrap functions, those that runs inside puppeteer's browser, should be a string.
 */
const scrapTransactionsPage = `() => {
  // scrap available limit data
  const availableLimit = document.querySelector('.available .amount')

  // scrap feed data
  const feed = []
  document.querySelectorAll('.transaction').forEach(item => {
    const type = item.querySelector('.type')
    const title = item.querySelector('.title')
    const description = item.querySelector('.description')
    const amount = item.querySelector('.amount')
    const tags = item.querySelector('.tags')
    const time = item.querySelector('.time')
    feed.push({
      // use kind insead of type, since type is a mongoose reservated word 
      // see: https://github.com/Automattic/mongoose/issues/1760
      kind: type && type.innerText,
      title: title && title.innerText,
      description: description && description.innerText,
      amount: amount && amount.innerText,
      tags: tags && tags.innerText,
      time: time && time.innerText
    })
  })

  // scrap last transaction data
  let lastTransaction = document.querySelector('.last-transaction')
  if (lastTransaction) {
    const time = lastTransaction.querySelector('.time')
    const title = lastTransaction.querySelector('.merchant')
    const amount = lastTransaction.querySelector('.amount')
    lastTransaction = {
      time: time ? time.innerText : undefined,
      title: title ? title.innerText : undefined,
      amount: amount ? amount.innerText : undefined
    }
  }

  return {
    limitAvailable: availableLimit ? availableLimit.innerText : undefined,
    lastTransaction: lastTransaction,
    feed: feed
  }
}`

export default scrapTransactionsPage
