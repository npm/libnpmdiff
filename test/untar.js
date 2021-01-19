const { resolve } = require('path')
const t = require('tap')
const pacote = require('pacote')
const untar = require('../lib/untar.js')

t.only('untar simple package', async t => {
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
    diffOpts: {
      nameOnly: true
    }
  })

  t.matchSnapshot([...files].join('\n'), 'should return list of filenames')
  t.matchSnapshot(
    [...refs.entries()].map(([k, v]) => `${k}: ${v.content}`).join('\n'),
    'should return map of filenames with undefined contents'
  )
})

t.test('filter files', async t => {
  const item =
    await pacote.tarball(resolve('./test/fixtures/simple-output-2.2.1.tgz'))

  const {
    files,
    refs
  } = await untar({
    item,
    prefix: 'a/'
  }, {
    diffOpts: {
      files: [
        './LICENSE',
        'missing-file',
        'README.md'
      ]
    }
  })

  t.matchSnapshot([...files].join('\n'), 'should return list of filenames')
  t.matchSnapshot(
    [...refs.entries()].map(([k, v]) => `${k}: ${!!v.content}`).join('\n'),
    'should return map of filenames with valid contents'
  )
})

t.test('filter files using glob expressions', async t => {
  const item =
    await pacote.tarball(resolve('./test/fixtures/archive.tgz'))
  const cwd = t.testdir({
    lib: {
      'index.js': '',
      utils: {
        '/b.js': '',
      }
    },
    'package-lock.json': '',
    'package.json': '',
    test: {
      '/index.js': '',
      utils: {
        'b.js': ''
      }
    }
  })

  const _cwd = process.cwd()
  process.chdir(cwd)
  t.teardown(() => {
    process.chdir(_cwd)
  })

  const {
    files,
    refs
  } = await untar({
    item,
    prefix: 'a/'
  }, {
    diffOpts: {
      files: [
        './lib/**',
        '*-lock.json',
        'test\\*', // windows-style sep should be normalized
      ]
    }
  })

  t.matchSnapshot([...files].join('\n'), 'should return list of filenames')
  t.matchSnapshot(
    [...refs.entries()].map(([k, v]) => `${k}: ${!!v.content}`).join('\n'),
    'should return map of filenames with valid contents'
  )
})

t.test('filter out all files', async t => {
  const item =
    await pacote.tarball(resolve('./test/fixtures/simple-output-2.2.1.tgz'))

  const {
    files,
    refs
  } = await untar({
    item,
    prefix: 'a/'
  }, {
    diffOpts: {
      files: [
        'non-matching-pattern',
      ]
    }
  })

  t.equal(files.size, 0, 'should have no files')
  t.equal(refs.size, 0, 'should have no refs')
})
