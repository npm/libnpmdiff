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

t.test('compare two diff specs', async t => {
  const path = t.testdir({
    a1: {
      'package.json': JSON.stringify({
        name: 'a',
        version: '1.0.0'
      }),
      'index.js': 'module.exports =\n  "a1"\n'
    },
    a2: {
      'package.json': JSON.stringify({
        name: 'a',
        version: '2.0.0'
      }),
      'index.js': 'module.exports =\n  "a2"\n'
    }
  })

  const a = `file:${resolve(path, 'a1')}`
  const b = `file:${resolve(path, 'a2')}`

  t.resolveMatchSnapshot(diff({ a, b }, {}), 'should output expected diff')
})

t.test('compare current dir with a given spec', async t => {
  const path = t.testdir({
    cwd: {
      'package.json': JSON.stringify({
        name: 'a',
        version: '1.0.0'
      }),
      'index.js': 'module.exports =\n  "foo"\n'
    },
    diff: {
      'package.json': JSON.stringify({
        name: 'a',
        version: '1.0.1'
      }),
      'index.js': 'const bar = "bar"\nmodule.exports =\n  bar\n'
    }
  })

  const cwd = resolve(path, 'cwd')
  const a = `file:${resolve(path, 'diff')}`

  t.resolveMatchSnapshot(
    diff({ a }, { prefix: cwd }), 'should output diff against cwd files')
})

t.test('compare current dir with a given spec no opts', async t => {
  const path = t.testdir({
    cwd: {
      'package.json': JSON.stringify({
        name: 'a',
        version: '1.0.0'
      }),
      'index.js': 'module.exports =\n  "foo"\n'
    },
    diff: {
      'package.json': JSON.stringify({
        name: 'a',
        version: '1.0.1'
      }),
      'index.js': 'const bar = "bar"\nmodule.exports =\n  bar\n'
    }
  })

  const cwd = resolve(path, 'cwd')
  const a = `file:${resolve(path, 'diff')}`

  const _cwd = process.cwd()
  process.chdir(cwd)
  t.teardown(() => {
    process.chdir(_cwd)
  })

  t.resolveMatchSnapshot(
    diff({ a }), 'should output diff against cwd files')
})
