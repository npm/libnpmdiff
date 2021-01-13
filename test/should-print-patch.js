const t = require('tap')
const shouldPrintPatch = require('../lib/should-print-patch.js')

t.test('valid filenames', t => {
  t.ok(shouldPrintPatch('LICENSE'))
  t.ok(shouldPrintPatch('.gitignore'))
  t.ok(shouldPrintPatch('foo.md'))
  t.ok(shouldPrintPatch('./bar.txt'))
  t.ok(shouldPrintPatch('/a/b/c/bar.html'))
  t.end()
})

t.test('invalid filenames', t => {
  t.notOk(shouldPrintPatch('foo.exe'))
  t.notOk(shouldPrintPatch('./foo.jpg'))
  t.notOk(shouldPrintPatch('/a/b/c/bar.bin'))
  t.end()
})
