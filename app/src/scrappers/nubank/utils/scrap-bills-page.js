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
 */
const scrapBillsPage = () => {
  const bills = []
  document.querySelectorAll('.md-tab-content').forEach(bill => {
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
    bills.push({
      period: {
        start: start ? start.innerText : undefined,
        end: end ? end.innerText : undefined
      },
      amount: amount ? amount.innerText : undefined,
      due: due ? due.innerText : undefined,
      detail: detail ? detail.innerText : undefined,
      charges: charges
    })
  })
  return bills
}

export default scrapBillsPage
