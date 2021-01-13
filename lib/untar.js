const tar = require('tar')

// files and refs are mutate params
// item, prefix and opts are read-only options
const untar = ({ files, refs }, { item, prefix, opts = {} }) =>
  new Promise((resolve, reject) => {
    const count = {
      queued: 0,
      read: 0
    }
    tar.list({
      filter: async (path, entry) => {
        if (
          entry.type !== 'File'
        ) return

        const key = path.replace(/^[^/]+\/?/, '')
        files.add(key)
        count.queued++

        entry.setEncoding('utf8')
        let content

        try {
          content = await entry.concat()
        } catch (e) {
          /* istanbul ignore next */
          return reject(Object.assign(
            new Error('failed to read files'),
            { code: 'EDIFFUNTAR' }
          ))
        }

        refs.set(`${prefix}${key}`, {
          content,
          mode: `100${entry.mode.toString(8)}`
        })
        count.read++

        if (count.queued === count.read) { resolve() }
      }
    })
      .on('error', reject)
      .end(item)
  })

const readTarballs = async (tarballs, opts) => {
  const files = new Set()
  const refs = new Map()
  const arr = [].concat(tarballs)

  for (const i of arr) {
    await untar({
      files,
      refs
    }, {
      item: i.item,
      prefix: i.prefix,
      opts
    })
  }

  return {
    files,
    refs
  }
}

module.exports = readTarballs
