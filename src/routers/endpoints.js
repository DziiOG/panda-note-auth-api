/**
 * @summary
 * This modules represents the endpoints construct for admin related API request.
 * All middlewares required for each endpoint methods are resgistered here
 * @author Whitson Dzimah <workwithwhitson@gmail.com>
 */

module.exports.name = 'endpoints'
module.exports.dependencies = [
  'UserController',
  'UserValidations',
  'MiscValidations',
  'Cache',
  'Uploader',
  'access',
  'miscHelper'
]
module.exports.factory = (
  UserController,
  UserValidations,
  MiscValidations,
  Cache,
  uploader,
  hasAccess,
  helper
) => {
  /**
   * @param { string } route defination
   * @param { Array<'post' || 'get'|| 'patch'|| 'put' || 'delete' >} methods allowed on a route
   * @param { bool } guard toggle for authentication
   * @param { { post: Array<Function>, get: Array<Function>, patch: Array<Function>, put: Array<Function>, delete: Array<Function> } } middlewares request handlers
   */

  const { ADMIN, NOTER } = helper.Roles
  return [
    // #endregion
    {
      route: 'signup',
      methods: ['post'],
      middleware: {
        post: [UserValidations.post, UserController.preInsert, UserController.insert]
      }
    },
    {
      route: 'verify-account/:token',
      methods: ['patch'],
      middleware: {
        patch: [UserValidations.paramsQuery, UserController.verifyAccount]
      }
    },
    {
      route: 'login',
      methods: ['post'],
      middleware: {
        post: [UserValidations.login, UserController.login]
      }
    },

    {
      route: 'logout',
      guard: true,
      methods: ['post'],
      middleware: {
        post: [UserController.logout]
      }
    },
    // #endregion
    // #region SETTINGS ROUTE
    {
      route: 'resend-verification-email/:email',
      methods: ['get'],
      middleware: {
        get: [UserValidations.paramsQuery, UserController.resendVerificationEmail]
      }
    },
    {
      route: 'password-resetting',
      methods: ['post', 'get', 'patch'],
      middleware: {
        post: [UserValidations.passwordResetRequest, UserController.passwordResetRequest],
        get: [UserValidations.verifyToken, UserController.verifyToken],
        patch: [UserValidations.resetPassword, UserController.resetPassword]
      }
    },
    {
      route: 'change-password',
      guard: true,
      methods: ['patch'],
      middleware: {
        patch: [UserValidations.changePassword, UserController.changePassword]
      }
    },
    {
      route: 'email-change-request',
      guard: true,
      methods: ['post'],
      middleware: {
        post: [UserValidations.changeEmailRequest, UserController.changeEmailRequest]
      }
    },
    {
      route: 'change-email/:token',
      methods: ['patch'],
      middleware: {
        patch: [UserValidations.paramsQuery, UserController.changeEmail]
      }
    },
    // #endregion
    // #region USER ROUTE
    {
      route: 'users',
      guard: true,
      methods: ['post', 'patch', 'get', 'delete'],
      middleware: {
        post: [
          hasAccess([ADMIN, NOTER]),
          UserValidations.post,
          UserController.preInsert,
          UserController.insert
        ],
        patch: [
          // uploader.user,
          UserValidations.patch,
          UserController.preUpdate,
          UserController.update
        ],
        get: [hasAccess([ADMIN, NOTER]), UserValidations.querySearch, UserController.get],
        delete: [UserController.preDelete, UserController.delete]
      }
    },

    // {
    //   route: 'users/profile',
    //   guard: true,
    //   methods: ['get'],
    //   middleware: {
    //     get: [UserController.cachedUser]
    //   }
    // },

    {
      route: 'users/:id',
      guard: true,
      methods: ['get', 'patch', 'delete'],
      middleware: {
        get: [MiscValidations.id, UserController.getById],
        patch: [
          MiscValidations.id,
          UserValidations.patch,
          UserController.preUpdate,
          UserController.update
        ],
        delete: [hasAccess([ADMIN]), MiscValidations.id, UserController.delete]
      }
    }
  ]
}
