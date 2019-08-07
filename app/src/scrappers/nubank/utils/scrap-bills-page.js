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

export default scrapBillsPage
