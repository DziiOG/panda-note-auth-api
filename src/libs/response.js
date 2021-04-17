/**
 * @author Whitson Dzimah <workwithwhitson@gmail.com>
 * @summary
 * This modules represents the response modules which defines
 * all the response (res) in this application
 */

module.exports.name = 'response'
module.exports.dependencies = false
module.exports.factory = () => {
  'use strict'

  const success = (res, message) => res.status(200).json({ statusCode: 200, message })

  const successWithData = (res, data, message, statusCode = 200) =>
    res.status(statusCode).json({ statusCode, message, data })

  const successWithFile = (res, file, type, name) => {
    res.setHeader('Content-Type', `application/${type}`)
    res.setHeader('Content-Disposition', `attachment; filename=${name}`)
    return res.status(200).sendFile(file)
  }

  const error = (res, message) => res.status(400).json({ statusCode: 400, message })

  const unauthorized = res => res.status(401).json({ statusCode: 401, message: 'Unauthorized' })

  const forbidden = res => res.status(403).json({ statusCode: 403, message: 'forbidden' })

  const notFound = res => res.status(404).json({ statusCode: 404, message: 'Not found' })

  const methodNotAllowed = res =>
    res.status(405).json({ statusCode: 405, message: 'Method not allowed' })

  const unprocessableEntity = (res, message = 'Unprocessable Entity') =>
    res.status(422).json({ statusCode: 422, message })

  const serverError = (res, message = 'Unexpected server error') =>
    res.status(500).json({ statusCode: 500, message })

  return {
    success,
    successWithData,
    successWithFile,
    error,
    unauthorized,
    forbidden,
    notFound,
    methodNotAllowed,
    unprocessableEntity,
    serverError
  }
}
