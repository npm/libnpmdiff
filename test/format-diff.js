const t = require('tap')

const formatDiff = require('../lib/format-diff.js')

const redactCwd = (path) => {
  const normalizePath = p => p
    .replace(/\\+/g, '/')
    .replace(/\r\n/g, '\n')
  return normalizePath(path)
}

t.cleanSnapshot = (str) => redactCwd(str)

t.test('format simple diff', t => {
  const files = new Set([
    'foo.js'
  ])
  const refs = new Map(Object.entries({
    'a/foo.js': {
      content: '"use strict"\nmodule.exports = "foo"\n',
      mode: '100644'
    },
    'b/foo.js': {
      content: '"use strict"\nmodule.exports = "foobar"\n',
      mode: '100644'
    }
  }))
  const versions = {
    a: '1.0.0',
    b: '2.0.0'
  }

  t.matchSnapshot(
    formatDiff({
      files,
      refs,
      versions
    }),
    'should output expected diff result'
  )
  t.end()
})

t.test('format removed file', t => {
  const files = new Set([
    'foo.js'
  ])
  const refs = new Map(Object.entries({
    'a/foo.js': {
      content: '"use strict"\nmodule.exports = "foo"\n',
      mode: '100644'
    }
  }))
  const versions = {
    a: '1.0.0',
    b: '2.0.0'
  }

  t.matchSnapshot(
    formatDiff({
      files,
      refs,
      versions
    }),
    'should output expected removed file diff result'
  )
  t.end()
})

t.test('changed file mode', t => {
  const files = new Set([
    'foo.js'
  ])
  const refs = new Map(Object.entries({
    'a/foo.js': {
      content: '"use strict"\nmodule.exports = "foo"\n',
      mode: '100644'
    },
    'b/foo.js': {
      content: '"use strict"\nmodule.exports = "foo"\n',
      mode: '100755'
    }
  }))
  const versions = {
    a: '1.0.0',
    b: '2.0.0'
  }

  t.matchSnapshot(
    formatDiff({
      files,
      refs,
      versions
    }),
    'should output expected changed file mode diff result'
  )
  t.end()
})

t.test('added file', t => {
  const files = new Set([
    'foo.js'
  ])
  const refs = new Map(Object.entries({
    'b/foo.js': {
      content: '"use strict"\nmodule.exports = "foo"\n',
      mode: '100755'
    }
  }))
  const versions = {
    a: '1.0.0',
    b: '2.0.0'
  }

  t.matchSnapshot(
    formatDiff({
      files,
      refs,
      versions
    }),
    'should output expected added file diff result'
  )
  t.end()
})

t.test('binary file', t => {
  const files = new Set([
    'foo.jpg'
  ])
  const refs = new Map(Object.entries({
    'a/foo.jpg': {
      content: Buffer.from(''),
      mode: '100644'
    },
    'b/foo.jpg': {
      content: Buffer.from(''),
      mode: '100644'
    }
  }))
  const versions = {
    a: '1.0.0',
    b: '2.0.0'
  }

  t.matchSnapshot(
    formatDiff({
      files,
      refs,
      versions
    }),
    'should output expected bin file diff result'
  )
  t.end()
})

t.test('nothing to compare', t => {
  const files = new Set([
    'foo.jpg'
  ])
  const refs = new Map(Object.entries({
    'a/foo.jpg': {},
    'b/foo.jpg': {}
  }))
  const versions = {
    a: '1.0.0',
    b: '2.0.0'
  }

  t.equal(
    formatDiff({
      files,
      refs,
      versions
    }),
    '',
    'should have no output'
  )
  t.end()
})

t.test('colored output', t => {
  const files = new Set([
    'foo.js'
  ])
  const refs = new Map(Object.entries({
    'a/foo.js': {
      content: '"use strict"\nmodule.exports = "foo"\n',
      mode: '100644'
    },
    'b/foo.js': {
      content: '"use strict"\nmodule.exports = "foobar"\n',
      mode: '100644'
    }
  }))
  const versions = {
    a: '1.0.0',
    b: '2.0.0'
  }

  t.matchSnapshot(
    formatDiff({
      files,
      refs,
      versions,
      opts: {
        color: true
      }
    }),
    'should output expected colored diff result'
  )
  t.end()
})

t.test('using --name-only option', t => {
  const files = new Set([
    'foo.js',
    'bar.js',
    'lorem.js',
    'ipsum.js',
  ])
  const refs = new Map()
  const versions = {
    a: '1.0.0',
    b: '2.0.0'
  }

  t.matchSnapshot(
    formatDiff({
      files,
      refs,
      versions,
      opts: {
        diffOpts: {
          nameOnly: true
        }
      }
    }),
    'should output expected diff result'
  )
  t.end()
})

t.test('respect --tag-version-prefix option', t => {
  const files = new Set([
    'foo.js'
  ])
  const refs = new Map(Object.entries({
    'a/foo.js': {
      content: '"use strict"\nmodule.exports = "foo"\n',
      mode: '100644'
    },
    'b/foo.js': {
      content: '"use strict"\nmodule.exports = "foobar"\n',
      mode: '100644'
    }
  }))
  const versions = {
    a: '1.0.0',
    b: '2.0.0'
  }

  t.matchSnapshot(
    formatDiff({
      files,
      refs,
      versions,
      opts: {
        tagVersionPrefix: 'b'
      }
    }),
    'should output expected diff result'
  )
  t.end()
})
