/**
 * @summary
 * This Factory handles sending of various kinds of emails
 * including signup and password resets
 * @author Whitson Dzimah <workwithwhitson@gmail.com>
 * @created June 19, 2020
 */

module.exports.name = 'redisCluster'
module.exports.dependencies = ['redis', 'logger', 'envs']
module.exports.factory = (redis, logger, getEnvs) => {
  // Get application configuration based on environment
  const appConfig = getEnvs(process.env.NODE_ENV)

  /**
   * This function creates a connection to a redis cluster
   * or normal redis instance based on the environment
   */
  const getRedisClusterClient = () => {
    try {
      let client = null
      client = redis.createClient(appConfig.redisPort, appConfig.redisHost)
      // Provide password for redis server on staging and testing environments
      if (process.env.NODE_ENV !== 'PROD') {
        client.auth(appConfig.redisPass, err => {
          if (err) {
            throw err
          }
        })
      }
      client.on('connect', () => {
        logger.debug(`Connected to redis on ${appConfig.redisHost}`)
      })

      return client
    } catch (error) {
      logger.getLogger().error(error)
      return Promise.reject(error)
    }
  }

  return getRedisClusterClient
}
