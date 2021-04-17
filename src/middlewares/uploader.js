/* eslint-disable space-before-function-paren */
'use strict'

/**
 * @author Whitson Dzimah <workwithwhitson@gmail.com>
 * @summary Uploader middleware
 * @name Uploader
 */
module.exports.name = 'Uploader'
module.exports.dependencies = [
  'path',
  'aws-sdk',
  'multer',
  'multer-s3',
  'fs-extra',
  'envs',
  'miscHelper',
  'logger',
  'response'
]
module.exports.factory = (path, aws, multer, multerS3, fs, getEnvs, helpers, logger, response) => {
  // Get enviroment variables
  const envs = getEnvs(process.env.NODE_ENV)
  // configurations
  const s3 = new aws.S3({ accessKeyId: envs.awsId, secretAccessKey: envs.awsSecret })

  const imageFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png'
    ) {
      cb(null, true)
    } else {
      cb(new Error('File type not allowed*'), false)
    }
  }

  const mediaFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'video/mp4' ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true)
    } else {
      cb(new Error('File type not allowed*'), false)
    }
  }

  const metadata = function (req, file, cb) {
    cb(null, { fieldName: file.fieldname })
  }

  const key = function (req, file, cb) {
    cb(null, `CF-${Date.now().toString() + path.extname(file.originalname)}`)
  }

  const callUploader = (upload, req, res, next) => {
    upload(req, res, err => {
      if (err instanceof multer.MulterError) {
        response.unprocessableEntity(res, err.message)
      } else if (err) {
        response.unprocessableEntity(res, err.message)
      } else {
        next()
      }
    })
  }

  const single = name => {
    return function (req, res, next) {
      const s3Storage = multerS3({
        s3,
        bucket: envs[name],
        metadata: metadata,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key
      })
      const upload = multer({
        storage: s3Storage,
        limits: { fileSize: 1024 * 1024 * 2 },
        fileFilter: imageFilter
      }).single(name)
      callUploader(upload, req, res, next)
    }
  }

  const inventory = (req, res, next) => {
    const s3Storage = multerS3({
      s3,
      bucket: envs.blockGallery,
      metadata,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key
    })
    const upload = multer({
      storage: s3Storage,
      limits: { fileSize: 1024 * 1024 * 5 },
      fileFilter: imageFilter
    }).fields([{ name: 'picture', maxCount: 1 }])
    callUploader(upload, req, res, next)
  }

  const blockGallery = (req, res, next) => {
    const s3Storage = multerS3({
      s3,
      bucket: envs.blockGallery,
      metadata,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key
    })
    const upload = multer({
      storage: s3Storage,
      limits: { fileSize: 1024 * 1024 * 5 },
      fileFilter: mediaFilter
    }).array('media', 6)
    callUploader(upload, req, res, next)
  }

  return { single, blockGallery, inventory }
}
