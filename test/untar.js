const { resolve } = require('path')
const t = require('tap')
const pacote = require('pacote')
const untar = require('../lib/untar.js')

t.test('untar simple package', async t => {
  const files = new Set()
  const refs = new Map()
  const item =
    await pacote.tarball(resolve('./test/fixtures/simple-output-2.2.1.tgz'))

  await untar({
    files,
    refs
  }, {
    item,
    prefix: 'a/'
  })

  t.matchSnapshot([...files].join('\n'), 'should return list of filenames')
  t.matchSnapshot(
    [...refs.entries()].map(([k, v]) => `${k}: ${!!v}`).join('\n'),
    'should return map of filenames to its contents'
  )
  t.matchSnapshot(refs.get('a/LICENSE').content, 'should have read contents')
})
