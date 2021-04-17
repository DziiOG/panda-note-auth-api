/**
 * @summary
 * This is the configuration file for database connnections
 * It decides which database to connect to based on the environment settings
 * @author Whitson Dzimah  <workwithwhitson@gmail.com>
 */

module.exports.name = 'db'
module.exports.dependencies = ['mongoose', 'Database', 'logger', 'log4js']
module.exports.factory = function (mongoose, Database, logger, log4js) {
  // Database configuration
  const { configureDB } = Database

  // Get connection string (We assume development environment)
  let connString = configureDB('DEV')

  if (process.env.NODE_ENV === 'TEST') {
    connString = configureDB('TEST')
  } else if (process.env.NODE_ENV === 'PROD') {
    connString = configureDB('PROD')
  }

  /**
   *
   * @param {Function} callback, function to be called when db
   * connection is opened
   * @returns db connection
   */
  const dbConfig = callback => {
    mongoose.connect(connString, { useNewUrlParser: true, useUnifiedTopology: true })
    const db = mongoose.connection
    mongoose.set('useCreateIndex', true)
    mongoose.set('useFindAndModify', false)

    // Database connection events
    db.on('connected', () => {
      logger.debug('Mongoose connected')
    })

    db.on('error', err => {
      logger.debug(`Database connection error: ${err}`)
      log4js.shutdown()
      process.exit(1)
    })

    db.on('disconnected', err => {
      logger.debug(`Database disconnection error: ${err}`)
      log4js.shutdown()
      process.exit(1)
    })

    // Execute callback method if database connection is opened
    db.on('open', () => {
      callback(mongoose)
    })

    return db
  }

  return { dbConfig }
}
