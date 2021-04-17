/* eslint-disable space-before-function-paren */
'use strict'

/**
 * @author Whitson Dzimah  <workwithwhitson@gmail.com>
 * @summary This class provides an interface to the model methods perform
 * CRUD related functionalities
 * @description This is a base repository class which provides basic
 * method that interface with the model methods for CRUD functionalities.
 * This class must be extended by other repository sub class.
 * This class assums all data coming are sterilized and validated properly.
 */
class BaseRepository {
  /**
   * @param { object } model The model which operations will be
   * performed on and also provides interface to the mongoose methods.
   * @param {{ debug: Function }} logger - Logger object
   */
  constructor(model, logger) {
    this.model = model
    this.logger = logger
    this.getById = this.getById.bind(this)
    this.getOne = this.getOne.bind(this)
    this.get = this.get.bind(this)
    this.insert = this.insert.bind(this)
    this.update = this.update.bind(this)
    this.delete = this.delete.bind(this)
    this.aggregate = this.aggregate.bind(this)
    this.count = this.count.bind(this)
  }

  /**
   * @param { object } error Error object
   */
  log(error) {
    return this.logger.getLogger().error(error)
  }

  /**
   * @param { string } method Unknown method called
   */
  __call(method) {
    this.log(new Error(`'${method}()' is missing!`))
  }

  /**
   * @description Insert a new record to a collection (model)
   *
   * @param { object } payload  The data to be inserted
   * @return { Promise<object>}} The new record inserted
   */
  async insert(payload) {
    try {
      return await this.model.create(payload)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * @description Fetch a specific record from a collection (model)
   * using it's unique identifier
   *
   * @param { string } _id The unique identifier of the record been queried
   * @return { Promise<object> } The matching record
   */
  async getById(_id) {
    try {
      return await this.model.findById(_id)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * @description Fetch only one record from a collection (model) which matches the query object
   *
   * @param { object } query The query object to filter the records
   * @return { Promise<object> } One matching record
   */
  async getOne(query) {
    try {
      return await this.model.findOne(query)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * @description Fetch some records in a collection (model)
   * which matches the query object(if any), or all records
   *
   * @param { object } query The query object to filter the records - optional
   * @return { Promise<Array<object>> } All or some matching records in the collection
   */
  async get(query = {}) {
    try {
      return await this.model.find(query)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * @description Update a record in a collection (model)
   * using it's unique identifier
   *
   * @param { string } _id The unique identifier of the record been updated
   * @param { object } data The updated data to replace the specified record field(s)
   * @return { Promise<object> } The updated record
   */
  async update(_id, data) {
    try {
      return await this.model.findByIdAndUpdate(_id, data, { new: true })
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * @description Delete a specific record from a collection (model)
   * using it's unique identifier
   *
   * @param { string } _id he unique identifier of the record been updated
   * @return { Promise<object> } The deleted record
   */
  async delete(_id) {
    try {
      return await this.model.findByIdAndRemove(_id)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * @description Returns the number of digitalfarmers
   *
   * @param { string } _id he unique identifier of the record been updated
   * @return { Promise<object> } The deleted record
   */
  async count(query) {
    try {
      return await this.model.count(query)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * @description Preforms mongoose aggregate operation to a collection (model),
   * which fetches records with their referencing collection (model)
   *
   * @param { Array<object> } query The query object to filter the records - required
   * @return { Promise<Array<object>> } The matching records in the collection
   */
  async aggregate(query) {
    try {
      return await this.model.aggregate(query)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = BaseRepository
