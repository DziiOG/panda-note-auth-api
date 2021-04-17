/* eslint-disable space-before-function-paren */
/**
 * @summary Generate unique randomize keys.
 * @author Whitson Dzimah <workwithwhitson@gmail.com>
 */
module.exports.name = 'GenerateKey'
module.exports.dependencies = ['async', 'randomatic', 'CounterModel', 'logger']
module.exports.factory = (async, randomize, counter, logger) => {
  'use strict'

  const { waterfall } = async

  /**
   * @description This method makes use of the counter model to
   * generate unique counts and then adds a randomize charaters to
   * add more unquiness to it, the finial result is prefix with a 'CF-'
   * @param {String} sequenceName
   * @param {Function} next
   */
  return (sequenceName, next) => {
    const chara = randomize('A0', 3)
    waterfall(
      [
        function findDoc(next) {
          counter
            .find({ _id: sequenceName }, (err, existingDoc) => {
              if (err) {
                next(err, null)
                return
              }
              if (existingDoc.length === 1) {
                counter.findOneAndUpdate(
                  { _id: sequenceName },
                  { $inc: { seq: 1 } },
                  { new: true },
                  (err, doc) => {
                    if (err) next(err, null)
                    var count = doc.seq
                    next(null, count)
                  }
                )
              } else {
                counter
                  .create({ _id: sequenceName })
                  .then(() => {
                    findDoc(next)
                  })
                  .catch(err => {
                    if (err) next(err, null)
                    logger.debug(err)
                  })
              }
            })
            .limit(1)
        },
        function sendCount(count, next) {
          var newSeq = count
          next(null, newSeq)
        }
      ],
      function (err, result) {
        if (err) {
          next(err, null)
          logger.getLogger().error(err)
          return
        }
        return next(`${sequenceName}-${chara}${result}`)
      }
    )
  }
}
