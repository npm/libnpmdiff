const Arborist = require('@npmcli/arborist')
const pacote = require('pacote')
const rpj = require('read-package-json-fast')

const formatDiff = require('./lib/format-diff.js')
const readPackageFiles = require('./lib/read-package-files.js')
const untar = require('./lib/untar.js')

const diffSelf = async (opts = {}) => {
  const { prefix: path } = opts

  const { name } = await rpj(`${opts.prefix}/package.json`)
  const aManifest = await pacote.manifest(`${name}@${opts.tag || 'latest'}`, opts)

  const versions = {
    a: aManifest.version,
    b: 'current'
  }

  const a = await pacote.tarball(aManifest._resolved, opts)
  const {
    files,
    refs
  } = await untar({
    prefix: 'a/',
    item: a
  }, opts)

  await readPackageFiles({
    path,
    files,
    refs,
    prefix: 'b/'
  })

  formatDiff({
    files,
    opts,
    refs,
    versions
  })
}

const diffComparison = async (specs, opts = {}) => {
  const { prefix: path } = opts

  let aManifest = await pacote.manifest(specs.a, opts)
  let bManifest

  // when using a single argument the spec to compare from is going to be
  // figured out from reading arborist.loadActual inventory and finding the
  // first package match for the same name
  if (!specs.b) {
    const arb = new Arborist({ ...opts, path })
    const actualTree = await arb.loadActual()
    const node = actualTree.inventory
      .query('name', aManifest.name)
      .values().next().value

    if (!node || !node.name || !node.package || !node.package.version) {
      const err = new TypeError('could not find something to compare against')
      err.code = 'EDIFFCOMPARE'
      throw err
    }

    bManifest = aManifest
    specs.b = specs.a
    specs.a = `${node.name}@${node.package.version}`
    aManifest = await pacote.manifest(specs.a, opts)
  } else {
    bManifest = await pacote.manifest(specs.b, opts)
  }

  const versions = {
    a: aManifest.version,
    b: bManifest.version
  }

  // fetches tarball using pacote
  const [a, b] = await Promise.all([
    pacote.tarball(aManifest._resolved, opts),
    pacote.tarball(bManifest._resolved, opts)
  ])

  // read all files
  // populates `files` and `refs`
  const {
    files,
    refs
  } = untar([
    {
      prefix: 'a/',
      item: a
    },
    {
      prefix: 'b/',
      item: b
    }
  ], opts)

  formatDiff({
    files,
    opts,
    refs,
    versions
  })
}

const diff = ({ a, b }, opts) => {
  // when using no arguments we're going to compare
  // the current package files with its latest published tarball
  if (!a) {
    return diffSelf(opts)

  // otherwise we're going to be comparing files from two tarballs
  } else {
    return diffComparison({ a, b }, opts)
  }
}

module.exports = diff
