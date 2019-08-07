/**
 * Method used inside profile page to scrap data.
 * This function scrap these infos:
 * - email
 * - phone
 * - totalLimit
 */
const scrapProfilePage = () => {
  const email = document.querySelector('#email')
  email = email ? email.value : undefined
  const phone = document.querySelector('#phone')
  phone = phone ? phone.value : undefined
  const totalLimit = document.querySelector('.card-summary .value')
  totalLimit = totalLimit ? totalLimit.innerText : undefined
  return {
    email,
    phone,
    totalLimit
  }
}

export default scrapProfilePage
