/* eslint-disable space-before-function-paren */
/**
 * This Factory handles sending of various kinds of emails
 * including signup and password resets
 * @author Whitson Dzimah
 * @created June 19, 2020
 */

module.exports.name = 'Mailer'
module.exports.dependencies = ['nodemailer', 'envs', 'email-templates', 'miscHelper']
module.exports.factory = (nodemailer, getEnvs, Email, helpers) => {
  'use strict'

  // Get application configuration based on environment
  const envs = getEnvs(process.env.NODE_ENV)

  // helpers
  const { appRoot } = helpers

  // SMTP Mail transporter
  const transporter = nodemailer.createTransport({
    host: envs.smtpHost,
    port: envs.smtpPort,
    secure: true,
    auth: { user: envs.smtpUser, pass: envs.smtpPass }
  })

  // Email Templete Setup
  const mailer = new Email({
    views: { root: `${appRoot}/emails`, options: { extension: 'hbs' } }
  })

  /**
   * @summary
   * @param { string } to
   * @param { string } role
   * @param { string } token
   */
  const signUp = async (to, role, token) => {
    try {
      const link = `${envs.authService}/verify-account/${token}`
      const source = await mailer.render(`verify/${role.toLowerCase()}`, {
        link
      })
      const mailOptions = {
        from: 'Complete Farmer <no-reply@completefarmer.com>',
        to,
        subject: 'Please Verify Your Email Address',
        html: source
      }
      return await transporter.sendMail(mailOptions)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const passwordReset = async (to, token) => {
    try {
      const confirm = `${envs.authService}/reset-password/${token}`
      const source = await mailer.render('updates/password-reset-request', {
        confirm
      })
      const mailOptions = {
        from: 'Complete Farmer <no-reply@completefarmer.com>',
        to,
        subject: 'Password Reset Request',
        html: source
      }
      return await transporter.sendMail(mailOptions)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const emailChange = async (to, token) => {
    try {
      const confirm = `${envs.authService}/settings/email-update/?${token}`
      const source = await mailer.render('updates/email-update', {
        confirm
      })
      const mailOptions = {
        from: 'Complete Farmer <no-reply@completefarmer.com>',
        to,
        subject: 'Please Verify Your Email Address',
        html: source
      }
      return await transporter.sendMail(mailOptions)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const oldEmailUpdate = async (to, newEmail) => {
    try {
      const mailOptions = {
        from: 'Complete Farmer <no-reply@completefarmer.com>',
        to,
        subject: 'Account Activities Alert',
        text: `
         You are receiving this because you (or someone else) has just requested for a change on your email to ${newEmail}.\n
         If you did not approve of this, please send an email to support@completefarmer.com for immediate action.\n
         You can ignore this email otherwise.
         `
      }
      return await transporter.sendMail(mailOptions)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const userUpdate = async (to, type) => {
    try {
      const mailOptions = {
        from: 'Complete Farmer <no-reply@completefarmer.com>',
        to,
        subject: 'Account Activities Alert',
        text: `
         You are receiving this because you (or someone else) has just completed an update of your ${type}.\n
         If you did not approve of this, please send an email to support@completefarmer.com for immediate action.\n
         You can ignore this email otherwise.
         `
      }
      return await transporter.sendMail(mailOptions)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  return {
    signUp,
    passwordReset,
    oldEmailUpdate,
    emailChange,
    userUpdate
  }
}
