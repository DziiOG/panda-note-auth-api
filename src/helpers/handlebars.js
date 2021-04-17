/* eslint-disable space-before-function-paren */
/**
 * Handlebars Helpers
 * @author Whitson Dzimah <workwithwhitson@gmail.com>
 */

module.exports.name = 'hbsHelpers'
module.exports.dependencies = false
module.exports.factory = () => {
  const hbsHelper = {
    getSignature: (arg1, arg2) => {
      if (arg1 === 'image') {
        return `<img src='${arg2}' style="width: 150px; height: 80px; padding: 10px;">`
      } else {
        return `<span style="margin-top: 50px;">${arg2}</span>`
      }
    }
  }

  return hbsHelper
}
