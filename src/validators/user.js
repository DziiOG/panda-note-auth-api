/**
 * User Validations. Defining user validations schema using celebrate
 * @author Whitson Dzimah
 */
module.exports.name = 'UserValidations'
module.exports.dependencies = ['celebrate', 'miscHelper']
module.exports.factory = (_celebrate, helpers) => {
  'use strict'

  const { celebrate, Joi } = _celebrate

  const { ACTIVE, INACTIVE } = helpers.Status
  const { ADMIN, NOTER } = helpers.Roles

  const post = celebrate({
    body: Joi.object().keys({
      // firstName: Joi.string()
      //   .regex(/^(?![\s.]+$)[a-zA-Z\s-_.]*$/)
      //   .required(),
      // lastName: Joi.string()
      //   .regex(/^(?![\s.]+$)[a-zA-Z\s-_.]*$/)
      //   .required(),
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      // phoneNumber: Joi.string()
      //   .regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/)
      //   .required(),
      // country: Joi.string().required(),
      role: Joi.string().valid(ADMIN, NOTER).required(),
      password: Joi.string().when('role', {
        is: [NOTER],
        then: Joi.string()
          .min(8)
          .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
          .required()
      })
    })
  })

  const patch = celebrate({
    body: Joi.object().keys({
      // firstName: Joi.string().regex(/^(?![\s.]+$)[a-zA-Z\s-_.]*$/),
      // lastName: Joi.string().regex(/^(?![\s.]+$)[a-zA-Z\s-_.]*$/),
      // dateOfBirth: Joi.date(),
      // phoneNumber: Joi.string().regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/),
      // address: Joi.object().keys({
      //   street: Joi.string().min(2),
      //   state: Joi.string().min(2),
      //   country: Joi.string().min(2)
      // }),
      roles: Joi.array().items(Joi.string().valid(ADMIN, NOTER).required()),
      // signature: Joi.object().keys({
      //   string: Joi.string(),
      //   check: Joi.string()
      // }),
      status: Joi.string().valid(ACTIVE, INACTIVE)
    })
  })

  const login = celebrate({
    body: Joi.object().keys({
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      password: Joi.string().required()
    })
  })

  const socialLogin = celebrate({
    body: Joi.object().keys({
      code: Joi.string().required(),
      type: Joi.string().required().valid('google', 'facebook', 'linkedin')
    })
  })

  const paramsQuery = celebrate({
    params: Joi.object()
      .keys({
        token: Joi.string(),
        email: Joi.string().email({ minDomainSegments: 2 })
      })
      .xor('token', 'email')
  })

  const querySearch = celebrate({
    query: Joi.object().keys({
      roles: Joi.string(),
      email: Joi.string(),
      users: Joi.string(),
      status: Joi.string().valid(ACTIVE, INACTIVE)
    })
  })

  const passwordResetRequest = celebrate({
    body: Joi.object().keys({
      email: Joi.string().email({ minDomainSegments: 2 }).required()
    })
  })

  const verifyToken = celebrate({
    query: Joi.object().keys({
      token: Joi.string().required()
    })
  })

  const resetPassword = celebrate({
    body: Joi.object().keys({
      id: Joi.string().required(),
      password: Joi.string().min(8).required()
    })
  })

  const changePassword = celebrate({
    body: Joi.object().keys({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).required()
    })
  })

  const changeEmailRequest = celebrate({
    body: Joi.object().keys({
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      password: Joi.string().min(8).required()
    })
  })

  return {
    post,
    patch,
    login,
    socialLogin,
    paramsQuery,
    querySearch,
    passwordResetRequest,
    verifyToken,
    resetPassword,
    changePassword,
    changeEmailRequest
  }
}
