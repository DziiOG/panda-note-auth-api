/**
 *  Cache midleware
 * @author Whitson Dzimah  <workwithwhitson@gmail.com>
 */
module.exports.name = 'Cache'
module.exports.dependencies = ['redisCluster', 'logger', 'miscHelper', 'response', 'util']
module.exports.factory = (redisCluster, logger, helper, response, util) => {
  // promsify
  const { promisify } = util
  // App logger
  const log = logger.getLogger()
  return function (key) {
    // Getting cached data
    const getCachedData = async (req, res, next) => {
      try {
        const client = redisCluster()
        let redisKey = key
        let buyerRedisKey = null
        const getAsync = promisify(client.get).bind(client)
        // Regex to test for mongo id correctness
        const regex = new RegExp(/^[0-9a-fA-F]{24}$/, 'i')
        // Grab the value of forth index from the url
        const recordId = req.originalUrl.split('/')[4]
        // test check and update rediskey
        if (recordId && recordId.match(regex)) {
          redisKey += recordId
        }
        if (req.user.roles[0] === helper.Roles.Buyer[0]) {
          buyerRedisKey = redisKey + req.user._id
        }
        const data = await getAsync(buyerRedisKey || redisKey)
        if (data) response.successWithData(res, JSON.parse(data), 'cached')
        else next()
      } catch (e) {
        log.error(e)
        next(e)
      }
    }

    // Removing cached data
    const delCachedData = async (req, res, next) => {
      try {
        const client = redisCluster()
        let redisKey = key
        const delAsync = promisify(client.del).bind(client)
        // Regex to test for mongo id correctness
        const regex = new RegExp(/^[0-9a-fA-F]{24}$/, 'i')
        // Grab the value of forth index from the url
        const recordId = req.originalUrl.split('/')[4]
        // test check and update rediskey
        if (recordId && recordId.match(regex)) {
          redisKey += recordId
        }
        await delAsync(redisKey)
        next()
      } catch (e) {
        log.error(e)
        next(e)
      }
    }

    return { getCachedData, delCachedData }
  }
}
