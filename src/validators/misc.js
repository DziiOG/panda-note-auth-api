/**
 * Order Validations. Defining order validations schema using celebrate
 * @author Whitson Dzimah
 */
module.exports.name = 'MiscValidations'
module.exports.dependencies = ['celebrate']
module.exports.factory = _celebrate => {
  'use strict'

  const { celebrate, Joi } = _celebrate

  /**
   *  @description Validation for crop specification api patch request.
   * The specificaiton is a object which is required and contains
   * other data within that may or may not be requried
   */
  const id = celebrate({
    params: Joi.object().keys({
      id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
    })
  })

  return { id }
}
