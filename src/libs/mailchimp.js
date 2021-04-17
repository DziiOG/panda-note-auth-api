/**
 * Factory function for AWS SNS
 * @author Whitson Dzimah
 * @created May 16, 2020
 */
module.exports.name = 'Mailchimp'
module.exports.dependencies = ['mailchimp-api-v3', 'md5', 'envs']
module.exports.factory = (Mailchimp, md5, envs) => {
  // Get application configuration based on environment
  const { mailchimpKey, mailchimpListId } = envs(process.env.NODE_ENV)
  const mailchimp = new Mailchimp(mailchimpKey)

  const subscribed = async user => {
    try {
      return await mailchimp.put(`/lists/${mailchimpListId}/members/${md5(user.email)}`, {
        email_address: user.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: user.firstName,
          LNAME: user.lastName
        }
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const pending = async user => {
    try {
      return await mailchimp.post(`/lists/${mailchimpListId}/members`, {
        email_address: user.email,
        status: 'pending',
        merge_fields: {
          FNAME: user.firstName,
          LNAME: user.lastName
        }
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }

  return { subscribed, pending }
}
