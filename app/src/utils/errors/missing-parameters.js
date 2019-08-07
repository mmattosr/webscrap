export default class MissingParametersError extends Error {
  name = 'MissingParametersError'
  httpStatus = 400
  parameters = undefined

  constructor(parameters) {
    super('Missing parameters')
    this.parameters = parameters
  }

  get data() {
    return {
      parameters: this.parameters
    }
  }
}
