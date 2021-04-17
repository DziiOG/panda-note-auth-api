/* eslint-disable space-before-function-paren */
'use strict'
const EventEmitter = require('eventemitter3')

/**
 * @author workwithwhitson <workwithwhitson@gmail.com>
 * @summary This class handles the http requests.
 * @description This is a base controller class which provides basic API endpoints methods
 * for handling http requests.This class must be extended by other controller sub class.
 * @extends EventEmitter adds event listent and emitting methods to the the controller
 */
class BaseController extends EventEmitter {
  /**
   * @param {object} repo The repository instance which will handle the operations to be
   * performed in this controller
   * @param {object} mongoose mongo database module
   * @param {object} helper - helper object
   * @param {object} logger - Logger object
   * @param {object} response - Response handler object
   */
  constructor(repo, mongoose, helper, logger, response) {
    super()
    this.name = 'Base'
    this.listening = false // toggle event listener agent
    this.repo = repo
    this.mongoose = mongoose
    this.helper = helper
    this.logger = logger
    this.response = response
    this.log = this.log.bind(this)
    this.objectId = this.objectId.bind(this)
    this.get = this.get.bind(this)
    this.insert = this.insert.bind(this)
    this.getOne = this.getOne.bind(this)
    this.update = this.update.bind(this)
    this.delete = this.delete.bind(this)
    this.getById = this.getById.bind(this)
  }

  /**
   * @param { string } method Unknown method called
   */
  __call(method) {
    this.log(new Error(`'${method}()' is missing!`))
  }

  /**
   * @param { object } error Error object
   * @returns {Function}
   */
  log(error) {
    return this.logger.getLogger().error(error)
  }

  /**
   * @param { string } id string id
   * @returns {object} casted mongoose id object
   */
  objectId(id) {
    return this.mongoose.Types.ObjectId(id)
  }

  /**
   * @summary Handle http request to create a new record
   *
   * @param { { body: {} } } req  The express request object
   * @param { object }       res  The express response object
   * @fires BaseController#insert This method
   * fires an event when the controller is listening for
   * any event, to perform extract action(s) that is needed
   * after creating a new record
   * @returns { Promise<Function> }
   */
  async insert(req, res) {
    try {
      const doc = await this.repo.insert(req.body)
      this.listening && this.emit('insert', req, doc)

      this.response.successWithData(res, doc, `${this.name} created successfully!`, 201)
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary Handle http request to fetch records
   *
   * @param { { query: {} } } req The express request object
   * @param { object }        res The express response object
   * @returns {Promise<Function>}
   */
  async get(req, res) {
    try {
      const doc = await this.repo.get(req.query)
      this.response.successWithData(res, doc)
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary Handle http request to fetch a record by it identifier
   *
   * @param { { params: { id: string } } } req The express request object
   * @param { object }                      res The express response object
   */
  async getById(req, res) {
    try {
      const doc = await this.repo.getById(this.objectId(req.params.id))
      this.response.successWithData(res, doc)
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary Handle http request to fetch one record which matches the query params
   *
   * @param { { query: {} } } req The express request object
   * @param { object }        res The express response object
   * @returns {Promise<Function>}
   */
  async getOne(req, res) {
    try {
      const doc = await this.repo.getOne(req.query)
      this.response.successWithData(res, doc)
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary Handle http request to update a record
   *
   * @param { { params: { id: string }, body: {} } } req The express request object
   * @param { object }                                res The express response object
   * @fires BaseController#update This method
   * fires an event when the controller is listening for
   * any event, to perform extract action(s) that is needed
   * after a record has been updated
   * @returns {Promise<Function>}
   */
  async update(req, res) {
    try {
      const doc = await this.repo.update(req.params.id, req.body)
      this.listening && this.emit('update', req, doc)
      this.response.successWithData(res, doc, `${this.name} updated successfully!`)
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary Handle http request to delete a record
   * @param { { params: { id: string } } } req The express request object
   * @param { object }                      res The express response object
   * @emits event:delete
   * @returns {Promise<Function>}
   */
  async delete(req, res) {
    try {
      const doc = await this.repo.delete(req.params.id)
      this.listening && this.emit('delete', req, doc)
      this.response.successWithData(res, doc, `${this.name} deleted successfully!`)
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }
}

module.exports = BaseController
