/**
 * User Model. Defining user schema using mongoose
 * @author Peter Yefi
 */

module.exports.name = 'UserModel'
module.exports.dependencies = ['mongoose', 'lodash', 'bcrypt', 'jsonwebtoken', 'envs', 'miscHelper']
module.exports.factory = (mongoose, lodash, bcrypt, jwt, getEnvs, helpers) => {
  'use strict'

  const { upperFirst } = lodash

  // Get application configuration based on environment
  const envs = getEnvs(process.env.NODE_ENV)

  const { ADMIN, NOTER } = helpers.Roles
  const { ACTIVE, INACTIVE, RESET } = helpers.Status

  // Define schema for user
  const schema = new mongoose.Schema(
    {
      // firstName: {
      //   type: String,
      //   required: [true, 'First name is required for registration']
      // },
      // lastName: {
      //   type: String,
      //   required: [true, 'Last name is required for registration']
      // },
      email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: [true, 'Email is required for registration']
      },
      password: {
        type: String,
        minlength: 8,
        required: [true, 'Password is required for registration']
      },
      // dateOfBirth: {
      //   type: String
      // },
      // phoneNumber: {
      //   type: String,
      //   required: [true, 'Phone number is required']
      // },
      // avatar: {
      //   type: String
      // },
      status: {
        type: String,
        enum: [ACTIVE, INACTIVE, RESET],
        default: 'INACTIVE'
      },
      roles: {
        type: [String],
        enum: [ADMIN, NOTER],
        required: [true, 'User registration requires a role'],
        default: [NOTER]
      }
    },
    {
      versionKey: false,
      timestamps: true,
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
      }
    }
  )

  // define presave method for hashing password
  schema.pre('save', function (next) {
    const user = this
    // if user name(s) is modified make sure it meets naming standard
    if (user.isModified('firstName') || user.isModified('lastName')) {
      user.firstName = upperFirst(user.firstName.toLowerCase())
      user.lastName = upperFirst(user.lastName.toLowerCase())
    }

    // if password is modified encrypt it
    if (user.isModified('password')) {
      user.password = bcrypt.hashSync(
        user.password,
        bcrypt.genSaltSync(parseInt(process.env.SALT_LENGTH))
      )
    }

    const { DIGITAL_FARMER, BUYER } = helpers.Roles
    // if user created is in house staff set account to active
    if (![DIGITAL_FARMER, BUYER].includes(user.roles[0])) {
      user.status = helpers.Status.ACTIVE
    }

    // generate a dummy avatar image for user
    if (!user.avatar) {
      user.avatar = `https://ui-avatars.com/api/?background=164B26&color=fff&name=${[
        user.firstName,
        user.lastName
      ].join('%20')}`
    }
    next()
  })

  // schema method for converting collection to plain json object
  schema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()
    delete userObj.password
    return userObj
  }

  // schema method for generating AuthToken
  schema.methods.generateAuthToken = function (expiresIn, data) {
    const user = this
    const userObj = user.toObject()
    delete userObj.password
    const authToken = jwt
      .sign(data || { _id: user._id.toHexString(), email: user.email }, envs.secret, {
        expiresIn: expiresIn || envs.expiresIn
      })
      .toString()
    return { user: userObj, authToken }
  }

  // schema method for comparing password
  schema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
  }

  return mongoose.model('User', schema)
}
