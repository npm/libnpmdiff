const { EOL } = require('os')

const colorizeDiff = require('@npmcli/disparity-colors')
const jsDiff = require('diff')

const shouldPrintPatch = require('./should-print-patch.js')

const formatDiff = ({ files, opts = {}, refs, versions }) => {
  if (opts.diffOpts && opts.diffOpts.nameOnly)
    return [...files].reduce((i, res) => `${i}${res}${EOL}`, '')

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

    if (contents.a === contents.b && modes.a === modes.b) continue

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
      if (modes.a && !modes.b) {
        header(`deleted file mode ${modes.a}`)
      } else if (!modes.a && modes.b) {
        header(`new file mode ${modes.b}`)
      } else {
        header(`old mode ${modes.a}`)
        header(`new mode ${modes.b}`)
      }
    }
    header(`index ${opts.tagVersionPrefix || 'v'}${versions.a}..${opts.tagVersionPrefix || 'v'}${versions.b} ${fileMode}`)

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

  return ''
}

module.exports = formatDiff
