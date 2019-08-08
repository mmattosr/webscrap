/**
 * Method used inside profile page to scrap data.
 * This function scrap these infos:
 * - email
 * - phone
 * - totalLimit
 */
const scrapProfilePage = () => {
  const email = document.querySelector('#email')
  const phone = document.querySelector('#phone')
  const totalLimit = document.querySelector('.card-summary .value')
  return {
    email: email ? email.value : undefined,
    phone: phone ? phone.value : undefined,
    totalLimit: totalLimit ? totalLimit.innerText : undefined
  }
}

export default scrapProfilePage
