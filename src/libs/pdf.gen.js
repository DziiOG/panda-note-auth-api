module.exports.name = 'PDFGenerator'
module.exports.dependencies = ['puppeteer', 'fs-extra', 'query-string', 'miscHelper']
module.exports.factory = (puppeteer, fs, queryString, helpers) => {
  'use strict'

  // helpers
  const { appRoot, getServerUrl, dateTime } = helpers

  const init = async (data, type, req) => {
    try {
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
      const page = await browser.newPage()
      const url = `${getServerUrl(req)}/api/v2/${type}?${queryString.stringify(data)}`
      await page.goto(url, { waitUntil: 'networkidle0' })
      const buffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: false,
        margin: 0,
        padding: 0
      })
      const filePath = `${appRoot}/temp/${type}-${dateTime}.pdf`
      await fs.writeFile(filePath, buffer)
      await browser.close()
      setTimeout(() => {
        fs.unlink(filePath)
      }, 30000)
      return filePath
    } catch (error) {
      return Promise.reject(error)
    }
  }

  return init
}
