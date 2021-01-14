const t = require('tap')

const readPackageFiles = require('../lib/read-package-files.js')

t.test('read files from a package cwd', async t => {
  const files = new Set()
  const refs = new Map()

  const path = t.testdir({
    'package.json': JSON.stringify({
      name: 'test-pkg',
      version: '1.0.0'
    }),
    'index.js': 'module.exports = () => "foo"',
    'test.js': '// TODO'
  })

  await readPackageFiles({
    files,
    path,
    prefix: 'a/',
    refs
  })

  t.matchSnapshot([...files].join('\n'), 'should return list of filenames')
  t.matchSnapshot(
    [...refs.entries()].map(([k, v]) => `${k}: ${!!v}`).join('\n'),
    'should return map of filenames to its contents'
  )
})
