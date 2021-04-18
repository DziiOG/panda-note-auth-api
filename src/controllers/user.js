/* eslint-disable space-before-function-paren */
'use strict'
const BaseController = require('./base')

/**
 * @author Whitson Dzimah <workwithwhitson@gmail.com>
 * @summary Controller to handle http request for order model related functions
 * @name UserController
 * @extends BaseController
 */
module.exports.name = 'UserController'
module.exports.dependencies = [
  'UserRepository',
  'authenticate',
  'miscHelper',
  'Mailer',
  'logger',
  'response',
  'mongoose'
]
module.exports.factory = class extends BaseController {
  /**
   * @param {object} repo The repository which will handle the operations to be
   * performed in this controller
   * @param {object} socialAuth - slack bot object with functions
   * @param {object} slackBot - slack bot object with functions
   * @param {object} mailchimp - mailchimp object with functions
   * @param {object} mailer - mailer object with functions
   * @param {object} authenticate - authenticate object with functions
   * @param {object} helper - helper object
   * @param {object} logger - logger object
   * @param {object} response - response handler object
   * @param {object} mongoose mongodb middleware
   */
  constructor(repo, authenticate, helper, mailer, logger, response, mongoose) {
    super(repo, helper, logger, response, mongoose)

    this.name = 'User'
    this.listening = true
    this.repo = repo
    this.helper = helper
    this.logger = logger
    this.response = response
    this.authenticate = authenticate
    this.mailer = mailer
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.preInsert = this.preInsert.bind(this)
    this.preUpdate = this.preUpdate.bind(this)
    this.preDelete = this.preDelete.bind(this)
    this.verifyToken = this.verifyToken.bind(this)
    this.changeEmail = this.changeEmail.bind(this)
    this.verifyAccount = this.verifyAccount.bind(this)
    this.resetPassword = this.resetPassword.bind(this)
    this.changePassword = this.changePassword.bind(this)
    this.changeEmailRequest = this.changeEmailRequest.bind(this)
    this.passwordResetRequest = this.passwordResetRequest.bind(this)
    this.resendVerificationEmail = this.resendVerificationEmail.bind(this)

    this.on('insert', async (req, doc) => {
      try {
        const { NOTER } = this.helper.Roles
        if (this.helper.contains(doc.roles, [NOTER])) {
          // Generate verificaiton token for user, expires in 1day
          // Generate verificaiton token for user, expires in 1day
          console.log('got here')
          const { authToken } = await doc.generateAuthToken('1d')
          console.log(authToken, 'token')
          await this.mailer.signUp(doc.email, doc.roles[0].toLowerCase(), authToken)
        }
      } catch (error) {
        this.log(error)
      }
    })

    this.on('verify', async user => {
      try {
        await this.slackBot.signUp(user)
        await this.mailchimp.subscribed(user)
      } catch (error) {
        this.log(error)
      }
    })

    // this.on('update', async (req, doc, type) => {
    //   try {
    //     const isAdmin = req.user.roles.includes(this.helper.Roles.ADMIN)
    //     if (!isAdmin) {
    //       // Remove user from redis cache
    //       await this.authenticate.removeCachedUser(req.token)

    //       // update user data in redis
    //       await this.authenticate.cacheUser(req.token, doc)
    //     }
    //   } catch (error) {
    //     this.log(error)
    //   }
    // })

    this.on('delete', async (req, doc) => {
      try {
        //  TODO: delete all user record?
      } catch (error) {
        this.log(error)
      }
    })
  }

  /**
   * @summary
   * Perform primary checks before creating user
   */
  async preInsert(req, res, next) {
    try {
      // if user exist in req obj then check to see that the person is an admin trying to create a user
      if (req.user) {
        if (req.user.roles.includes(this.helper.Roles.ADMIN)) {
          req.body.password = 'CF-P@33w0rD'
        } else {
          return this.response.forbidden(res)
        }
      }
      // throw error if email already exist
      const result = await this.repo.getOne({ email: req.body.email })
      if (result) throw new Error('A user with this email already exist')
      req.body.roles = [req.body.role]
      next()
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary
   * Can update the request body adding the uploaded files if any.
   * Perform some routine checks for some speical kind of updates.
   * Can update the request params, adding the request user id before
   * proceeding to call update method. This is to allow user make
   * calls without sending their unqiue id
   */
  preUpdate(req, res, next) {
    if (this.helper.isNotEmpty(req.files)) {
      if (req.files.avatar) {
        req.body.avatar = req.files.avatar[0].location
      }
    }
    // Only admin is allowed to perform this action of updating user roles and status
    if ((req.body.roles || req.body.status) && !req.user.roles.includes(this.helper.Roles.ADMIN)) {
      return this.response.forbidden(res)
    }

    if (!req.params.id) req.params.id = req.user._id

    next()
  }

  /**
   * @summary
   * Updates the request params, adding the request user id before
   * proceeding to call delete method. This is to allow user make
   * calls without sending their unqiue id
   */
  preDelete(req, res, next) {
    req.params.id = req.user._id
    next()
  }

  /**
   * @summary Resend a verification email to a user
   */
  async resendVerificationEmail(req, res, next) {
    try {
      const user = await this.repo.getOne({ email: req.params.email })
      if (!user) throw new Error('No user is associated with this email address')
      if (user.status === this.helper.Status.ACTIVE) {
        throw new Error('Account is already active, please login')
      } else {
        // Generate authentication token for user
        this.response.success(res, `Email was re-sent to ${user.email}`)
      }
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary Perform account activiation
   */
  async verifyAccount(req, res) {
    try {
      const ACTIVE = this.helper.Status.ACTIVE
      const data = await this.authenticate.verifyToken(req.params.token)
      if (!data) throw new Error(1)
      const user = await this.repo.getById(data._id)
      if (!user) throw new Error(2)
      if (user.status === ACTIVE) throw new Error(3)
      user.status = ACTIVE
      user.save()
      this.response.successWithData(res, user.email)
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary Authenticates a user
   */
  async login(req, res) {
    try {
      // check to see if email exist
      const user = await this.repo.getOne({ email: req.body.email })
      if (!user) throw new Error('Incorrect email or password')
      // check to see if password match
      const isMatch = await user.comparePassword(req.body.password)
      if (!isMatch) throw new Error('Incorrect email or password')
      // check to see if account is activated
      if (user.status === this.helper.Status.INACTIVE) {
        throw new Error('Account inactive, please activate')
      } else {
        // Generate authentication token for user
        const data = await user.generateAuthToken()
        // cache user in redis and return
        // await this.authenticate.cacheUser(data.authToken, data.user)
        this.response.successWithData(res, data)
      }
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary De-authenticates a user
   */
  async logout(req, res) {
    try {
      // remove cache user in redis
      this.response.success(res, 'User logged out successfully')
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary Retrive a user from redis db
   */
  // async cachedUser(req, res) {
  //   this.response.successWithData(res, req.user)
  // }

  /**
   * @summary When a user request for a password reset we
   * generate a token link which is valid for 1hr, the user needs to
   * access the link to continue resetting of their password
   */
  async passwordResetRequest(req, res) {
    try {
      // check to see if email exist
      const user = await this.repo.getOne({ email: req.body.email })
      if (!user) throw new Error('No user is associated with this email address')
      // Generate authentication token for user
      this.response.success(res, `An email has been sent to ${user.email} for further actions`)
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary Token sent to user email is been verified
   */
  async verifyToken(req, res) {
    try {
      const data = await this.authenticate.verifyToken(req.query.token)
      if (!data) throw new Error(1)
      this.response.successWithData(res, data._id)
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary Reset a user password without been logged in
   */
  async resetPassword(req, res) {
    try {
      const user = await this.repo.getById(req.body.id)
      if (!user) throw new Error('We were unable to associate a user with this account')
      // check to see if new password matches old password
      const isMatch = await user.comparePassword(req.body.password)
      if (isMatch) throw new Error('Previous password cannot be reused')
      user.password = req.body.password
      await user.save()
      this.emit('update', req, user, 'password')
      this.response.success(res, 'Password successfully changed')
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary Change a user password when logged in
   */
  async changePassword(req, res) {
    try {
      const user = await this.repo.getById(req.user._id)
      if (!user) throw new Error('We were unable to associate a user with this account')
      // check to see if old password is correct
      const isCorrect = await user.comparePassword(req.body.oldPassword)
      if (!isCorrect) throw new Error('Incorrect password')
      // check to see if new password matches old password
      const isMatch = await user.comparePassword(req.body.newPassword)
      if (isMatch) throw new Error('Previous password cannot be reused')
      user.password = req.body.newPassword
      await user.save()
      this.emit('update', req, user, 'password')
      this.response.success(res, 'Password successfully changed')
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary When a user request for an email change we
   * generate a token link which is valid for 1hr, the user needs to
   * access the link to continue resetting of their email
   */
  async changeEmailRequest(req, res) {
    try {
      const user = await this.repo.getById(req.user._id)
      if (!user) throw new Error('We were unable to associate a user with this account')
      // check to see if new password matches old password
      const isMatch = await user.comparePassword(req.body.password)
      if (!isMatch) throw new Error('Incorrect password')
      if (user.email === req.body.email) throw new Error('Previous email cannot be reused')
      // Generate authentication token for user

      this.response.success(res, `An email has been sent to ${req.body.email} for further actions`)
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }

  /**
   * @summary Updates a user email
   */
  async changeEmail(req, res) {
    try {
      const { _id, email } = await this.authenticate.verifyToken(req.params.token)
      const user = await this.repo.getById(_id)
      if (!user) throw new Error('We were unable to associate a user with this account')
      user.email = email
      await user.save()
      this.emit('update', req, user, 'email')
      this.response.success(res, 'Email successfully changed')
    } catch (error) {
      this.response.error(res, error.message || error)
    }
  }
}
