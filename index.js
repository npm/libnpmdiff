const pacote = require('pacote')

const formatDiff = require('./lib/format-diff.js')
const untar = require('./lib/untar.js')

const diff = async (specs, opts = {}) => {
  const { prefix: path } = opts

  let aManifest = await pacote.manifest(specs.a, opts)
  let bManifest

  // when using a single argument the spec to compare from is going to be
  // figured out from reading the current location package
  if (!specs.b) {
    bManifest = aManifest
    specs.b = specs.a
    specs.a = `file:${path || '.'}`
    aManifest = await pacote.manifest(specs.a, opts)
  } else
    bManifest = await pacote.manifest(specs.b, opts)

  const versions = {
    a: aManifest.version,
    b: bManifest.version,
  }

  // fetches tarball using pacote
  const [a, b] = await Promise.all([
    pacote.tarball(aManifest._resolved, opts),
    pacote.tarball(bManifest._resolved, opts),
  ])

  // read all files
  // populates `files` and `refs`
  const {
    files,
    refs,
  } = await untar([
    {
      prefix: 'a/',
      item: a,
    },
    {
      prefix: 'b/',
      item: b,
    },
  ], opts)

  return formatDiff({
    files,
    opts,
    refs,
    versions,
  })
}

module.exports = diff
