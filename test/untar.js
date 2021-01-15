const { resolve } = require('path')
const t = require('tap')
const pacote = require('pacote')
const untar = require('../lib/untar.js')

t.test('untar simple package', async t => {
  const item =
    await pacote.tarball(resolve('./test/fixtures/simple-output-2.2.1.tgz'))

  const {
    files,
    refs
  } = await untar({
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

t.test('untar package with folders', async t => {
  const item =
    await pacote.tarball(resolve('./test/fixtures/archive.tgz'))

  const {
    files,
    refs
  } = await untar({
    item,
    prefix: 'a/'
  })

  t.matchSnapshot([...files].join('\n'), 'should return list of filenames')
  t.matchSnapshot(
    [...refs.entries()].map(([k, v]) => `${k}: ${!!v}`).join('\n'),
    'should return map of filenames to its contents'
  )
  t.matchSnapshot(
    refs.get('a/lib/utils/b.js').content,
    'should have read contents'
  )
})

t.test('using --name-only option', async t => {
  const item =
    await pacote.tarball(resolve('./test/fixtures/simple-output-2.2.1.tgz'))

  const {
    files,
    refs
  } = await untar({
    item,
    prefix: 'a/',
  }, {
    nameOnly: true
  })

  t.matchSnapshot([...files].join('\n'), 'should return list of filenames')
  t.matchSnapshot(
    [...refs.entries()].map(([k, v]) => `${k}: ${v.content}`).join('\n'),
    'should return map of filenames with undefined contents'
  )
})
