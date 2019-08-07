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
 */
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

export default scrapTransactionsPage
