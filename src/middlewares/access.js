/**
 * Functional Module for user authentication
 * @author Whitson Dzimah <workwithwhitson@gmail.com>
 */
module.exports.name = 'access'
module.exports.dependencies = ['response', 'miscHelper']
module.exports.factory = (response, helper) => {
  return function (allowed) {
    return function (req, res, next) {
      if (req.user) {
        if (helper.contains(req.user.roles, allowed)) {
          return next()
        } else return response.forbidden(res)
      } else if (req.bot) {
        return next()
      } else return response.forbidden(res)
    }
  }
}
