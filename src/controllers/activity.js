/* eslint-disable space-before-function-paren */
'use strict'
const BaseController = require('./base')

/**
 * @author Chinedu Ekene Okpala <chinedu.okpala@completefarmer.com>
 * @summary Controller to handle http request for order model related functions
 * @name RoleController
 * @extends BaseController
 */
module.exports.name = 'ActivityController'
module.exports.dependencies = ['UserRepository', 'miscHelper', 'logger', 'response', 'mongoose']
module.exports.factory = class extends BaseController {
  /**
   * @param { object } repo Role repository which will handle role doc manipulation
   * @param { object } userRepo User repository which will handle user doc manipulation
   * @param { object } mailer - mailer object with functions
   * @param { object } helper - helper object
   * @param { object } logger - logger object
   * @param { object } response - response handler object
   * @param { object } mongoose mongodb middleware
   */
  constructor(repo, helper, logger, response, mongoose) {
    super(repo, mongoose, helper, logger, response)
    this.name = 'Role'
    this.repo = repo
    this.helper = helper
    this.logger = logger
    this.response = response
  }
}
