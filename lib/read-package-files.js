const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

const packlist = require('npm-packlist')

const readPackageFiles = async ({ files, path, prefix, refs }) => {
  const filenames = await packlist({ path })
  const read = await Promise.all(
    filenames.map(filename => Promise.all([
      filename,
      readFile(filename, { encoding: 'utf8' }),
      stat(filename)
    ]))
  )

  for (const [filename, content, stat] of read) {
    files.add(filename)
    refs.set(`${prefix}${filename}`, {
      content,
      mode: stat.mode.toString(8)
    })
  }
}

module.exports = readPackageFiles
