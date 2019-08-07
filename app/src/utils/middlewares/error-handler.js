export default function errorHandler(err, req, res, next) {
  if (!err) {
    next()
    return
  }
  // Treated error
  else if (error.httpStatus) {
    res.status(error.status)
    res.send({
      error: {
        message: error.message,
        ...error.data
      }
    })
  }
  // Untreated error
  else {
    console.error(error.stack)
    res.status(500)
    res.send({
      error: {
        message: error.message
      }
    })
  }
}