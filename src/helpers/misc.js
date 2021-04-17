/* eslint-disable space-before-function-paren */
/**
 *
 * @author Whitson Dzimha <workwithwhitson@gmail.com>
 */

module.exports.name = 'miscHelper'
module.exports.dependencies = ['path', 'lodash', 'lodash/fp', 'moment', 'node-fetch']
module.exports.factory = (path, lodash, fp, moment, fetch) => {
  const { isEmpty, pick } = lodash
  const { flow, groupBy, map } = fp
  const map2 = map.convert({ cap: false })

  // resovle app root path
  const appRoot = path.resolve('src')

  const getServerUrl = req => req && req.protocol + '://' + req.get('host')

  const getData = item => !isEmpty(item) && item

  const contains = (arr1, arr2) => {
    if (!isEmpty(arr1) && !isEmpty(arr2)) return arr1.some(ele => arr2.includes(ele))
    return false
  }

  const isNotEmpty = val => !isEmpty(val)

  const _pick = (obj, arr) => pick(obj, arr)
  const _groupBy = (data, id) => {
    return flow(
      groupBy(id),
      map2(data => data)
    )(data)
  }

  const addForwardSlash = string => {
    let x = string

    x = [...x]

    if (x[0] !== '/') {
      x.unshift('/')

      x = x.toString().replace(/,/g, '')
    }

    if (x[0] === '/') x = x.toString().replace(/,/g, '')

    return x
  }

  const Roles = {
    ADMIN: 'ADMIN',
    NOTER: 'NOTER'
  }

  const Status = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED'
  }

  const getQuery = query => {
    let queryString = ''
    Object.keys(query).forEach(key => {
      if (!(query[key] === null || query[key] === '')) queryString += key + '=' + query[key] + '&'
    })
    const n = queryString.lastIndexOf('&')
    return queryString.slice(0, n) + queryString.slice(n).replace('&', '')
  }

  const ajax = async (url, authorization, body, method = 'GET') =>
    await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: authorization,
        'Content-Type': 'application/json'
      },
      body
    }).then(res => res.json())

  const formatDate = (date, format) => moment(date ? new Date(date) : new Date()).format(format)

  const formatDateISO = (date, format) => new Date(moment(date, format))

  const getDate = (date, num, type) => moment(date).add(num, type).format()

  const dateTime = new Date().toISOString().slice(-24).replace(/\D/g, '').slice(0, 14)

  return {
    appRoot,
    getServerUrl,
    getData,
    contains,
    Roles,
    Status,
    getQuery,
    ajax,
    formatDate,
    formatDateISO,
    getDate,
    dateTime,
    isNotEmpty,
    _pick,
    _groupBy,
    addForwardSlash
  }
}
