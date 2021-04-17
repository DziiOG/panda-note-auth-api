/**
 * @summary
 * This is the configuration file for the application enviroment variables
 * @author Whitson Dzimah  <workwithwhitson@gmail.com>
 */
module.exports.name = 'envs'
module.exports.dependencies = false
module.exports.factory = () => {
  'use strict'

  /**
   *
   * @param {string} env, a string representing the environment of application
   * @returns an object having configuration settings for the application
   */
  const getEnvs = env => {
    return {
      botEmail: process.env.BOT_EMAIL,
      botPass: process.env.BOT_PASS,
      clientUser: process.env[`${env}_CLIENT_USER`],
      clientAdmin: process.env[`${env}_CLIENT_ADMIN`],
      clientBuyer: process.env[`${env}_CLIENT_BUYER`],
      authApi: process.env[`${env}_AUTH_API`],
      operationsApi: process.env[`${env}_OPERATIONS_API`],
      dbUrl: process.env[`${env}_DB_CONNECTION`],
      dbName: process.env[`${env}_COLLECTION_NAME`],
      awsId: process.env.AWS_ACCESS_KEY_ID,
      awsSecret: process.env.AWS_SECRET_ACCESS_KEY,
      awsRegion: process.env.AWS_REGION,
      docBucket: process.env[`${env}_S3_DOC_BUCKET`],
      cropCatImg: process.env[`${env}_S3_CROP_CATS_BUCKET`],
      cropImg: process.env[`${env}_S3_CROPS_BUCKET`],
      cropVarImg: process.env[`${env}_S3_CROP_VARS_BUCKET`],
      blockGallery: process.env[`${env}_S3_BLOCK_GALLERY_BUCKET`],
      secret: process.env.SECRET,
      expiresIn: process.env.EXPIRES_IN,
      smtpUser: process.env[`${env}_SMTP_USER`],
      smtpPass: process.env[`${env}_SMTP_PASS`],
      smtpHost: process.env[`${env}_SMTP_HOST`],
      smtpPort: process.env[`${env}_SMTP_PORT`],
      redisHost: process.env[`${env}_REDIS_HOST`],
      redisPort: process.env[`${env}_REDIS_PORT`],
      redisPass: process.env.REDIS_PASS,
      digitalfarmerApi: process.env[`${env}_DIGITAL_FARMER_API`],
      eosApi: process.env.EOS_API,
      eosApiKey: process.env.EOS_API_KEY
    }
  }

  return getEnvs
}
