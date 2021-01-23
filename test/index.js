const { resolve } = require('path')

const t = require('tap')

const diff = require('../index.js')

const redactCwd = (path) => {
  const normalizePath = p => p
    .replace(/\\+/g, '/')
    .replace(/\r\n/g, '\n')
  return normalizePath(path)
}

t.cleanSnapshot = (str) => redactCwd(str)

const json = (obj) => `${JSON.stringify(obj, null, 2)}\n`

t.test('compare two diff specs', async t => {
  const path = t.testdir({
    a1: {
      'package.json': json({
        name: 'a',
        version: '1.0.0',
      }),
      'index.js': 'module.exports =\n  "a1"\n',
    },
    a2: {
      'package.json': json({
        name: 'a',
        version: '2.0.0',
      }),
      'index.js': 'module.exports =\n  "a2"\n',
    },
  })

  const a = `file:${resolve(path, 'a1')}`
  const b = `file:${resolve(path, 'a2')}`

  t.resolveMatchSnapshot(diff([a, b], {}), 'should output expected diff')
})

t.test('using single arg', async t => {
  await t.rejects(
    diff(['abbrev@1.0.3']),
    /libnpmdiff needs two arguments to compare/,
    'should throw EDIFFARGS error'
  )
})

t.test('too many args', async t => {
  const args = ['abbrev@1.0.3', 'abbrev@1.0.4', 'abbrev@1.0.5']
  await t.rejects(
    diff(args),
    /libnpmdiff needs two arguments to compare/,
    'should output diff against cwd files'
  )
})
