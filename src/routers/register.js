/**
 * @summary
 * This modules represents the router modules which defines
 * all the routes (endpoints) in this application
 * @author Whitson Dzimah <workwithwhitson@gmail.com>
 */

module.exports.name = 'routers'
module.exports.dependencies = [
  'express',
  'swagger-ui-express',
  // 'authenticate',
  'response',
  'endpoints'
]
module.exports.factory = (express, swaggerUi, response, endpoints) => {
  // init express router
  const router = express.Router()

  // auth checker
  // const authChecker = guard => (guard ? authenticate.auth : (req, res, next) => next())

  // Add Swagger API Documentation
  const swaggerDocument = require('../swagger.json')

  // register all routes here
  router.use('/api-docs', swaggerUi.serve)
  endpoints.forEach(endpoint => {
    endpoint.methods.forEach(method => {
      router[method](
        `/${endpoint.route}`,
        // authChecker(endpoint.guard),
        ...endpoint.middleware[method]
      )
    })
    router.all(`/${endpoint.route}`, (req, res) => response.methodNotAllowed(res))
  })
  router.get('/api-docs', swaggerUi.setup(swaggerDocument))
  router.all('*', (req, res) => response.notFound(res))

  return router
}
