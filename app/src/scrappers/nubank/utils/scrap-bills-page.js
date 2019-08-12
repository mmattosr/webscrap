/**
 * Method used inside bills page to scrap data.
 * This function scrap these infos:
 * - bills
 *  - period start and end
 *  - amount
 *  - due date
 *  - details
 *  - charges
 *    - time
 *    - description
 *    - amount
 * 
 * Obs.: To prevent transpiler issues all scrap functions, those that runs inside puppeteer's browser, should be a string.
 */
const scrapBillsPage = `async () => {
  const result = []
  const bills = document.querySelectorAll('.md-tab-content')
  for (let i = 0; i < bills.length; i++) {
    const bill = bills[i];

    // get bill id
    if (!bill.id) return resolve()
    const id = bill.id.replace('content_', '')
    if (!id) return resolve()

    // get tab
    const tab = document.querySelector('#' + id)
    if (!tab) return resolve()

    // click on tab to load it's content
    tab.click()

    // sleep for 500ms to wait page load
    await (new Promise(r => setTimeout(r, 300)))

    // scrap bill content
    const period = bill.querySelectorAll('.charges .period span')
    const start = period[0]
    const end = period[1]
    const amount = bill.querySelector('.summary .amount')
    const due = bill.querySelector('.summary .due .date')
    const detail = bill.querySelector('.summary .detail')
    const charges = []
    bill.querySelectorAll('.charges .charge').forEach(charge => {
      const time = charge.querySelector('.time')
      const description = charge.querySelector('.description')
      const amount = charge.querySelector('.amount')
      charges.push({
        time: time ? time.innerText : undefined,
        description: description ? description.innerText : undefined,
        amount: amount ? amount.innerText : undefined
      })
    })

    // returns scrapped bill's content
    result.push({
      period: {
        start: start ? start.innerText : undefined,
        end: end ? end.innerText : undefined
      },
      amount: amount ? amount.innerText : undefined,
      due: due ? due.innerText : undefined,
      detail: detail ? detail.innerText : undefined,
      charges: charges
    })
  }
  return result
}`

export default scrapBillsPage
