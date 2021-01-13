const fs = require('fs')
const { EOL } = require('os')
const { promisify } = require('util')

const colorizeDiff = require('@npmcli/disparity-colors')
const Arborist = require('@npmcli/arborist')
const jsDiff = require('diff')
const pacote = require('pacote')
const packlist = require('npm-packlist')
const rpj = require('read-package-json-fast')

const shouldPrintPatch = require('./lib/should-print-patch.js')
const untar = require('./lib/untar.js')

const printDiff = ({ files, opts, refs, versions }) => {
  for (const filename of files.values()) {
    const names = {
      a: `a/${filename}`,
      b: `b/${filename}`
    }

    let fileMode = ''
    const filenames = {
      a: refs.get(names.a),
      b: refs.get(names.b)
    }
    const contents = {
      a: filenames.a && filenames.a.content,
      b: filenames.b && filenames.b.content
    }
    const modes = {
      a: filenames.a && filenames.a.mode,
      b: filenames.b && filenames.b.mode
    }

    if (contents.a === contents.b) continue

    let res = ''
    let headerLength = 0
    const header = str => {
      headerLength++
      res += `${str}${EOL}`
    }

    // manually build a git diff-compatible header
    header(`diff --git ${names.a} ${names.b}`)
    if (modes.a === modes.b) {
      fileMode = filenames.a.mode
    } else {
      if (modes.a && modes.b) {
        header(`old mode ${modes.a}`)
        header(`new mode ${modes.b}`)
      } else if (modes.a && !modes.b) {
        header(`deleted file mode ${modes.a}`)
      } else if (!modes.a && modes.b) {
        header(`new file mode ${modes.b}`)
      }
    }
    header(`index ${versions.a}..${versions.b} ${fileMode}`)

    if (shouldPrintPatch(filename)) {
      res += jsDiff.createTwoFilesPatch(
        names.a,
        names.b,
        contents.a || '',
        contents.b || '',
        '',
        '',
        { context: 3 }
      ).replace(
        '===================================================================\n',
        ''
      )
      headerLength += 2
    } else {
      header(`--- ${names.a}`)
      header(`+++ ${names.b}`)
    }

    return opts.color
      ? colorizeDiff(res, { headerLength })
      : res
  }
}

const readPackageFiles = async ({ files, path, prefix, refs }) => {
  const readFile = promisify(fs.readFile)
  const stat = promisify(fs.stat)
  const filenames = await packlist({ path })
  const read = await Promise.all(
    filenames.map(filename => Promise.all([
      filename,
      readFile(filename, { encoding: 'utf8' }),
      stat(filename)
    ]))
  )

  for (const [filename, content, stat] of read) {
    files.add(filename)
    refs.set(`${prefix}${filename}`, {
      content,
      mode: stat.mode.toString(8)
    })
  }
}

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

  printDiff({
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

  printDiff({
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
