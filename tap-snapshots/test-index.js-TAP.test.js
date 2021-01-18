/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/index.js TAP compare current dir with a given spec > should output diff against cwd files 1`] = `
diff --git a/index.js b/index.js
index v1.0.0..v1.0.1 100644
--- a/index.js
+++ b/index.js
@@ -1,2 +1,3 @@
+const bar = "bar"
 module.exports =
-  "foo"
+  bar

`

exports[`test/index.js TAP compare two diff specs > should output expected diff 1`] = `
diff --git a/index.js b/index.js
index v1.0.0..v2.0.0 100644
--- a/index.js
+++ b/index.js
@@ -1,2 +1,2 @@
 module.exports =
-  "a1"
+  "a2"

`
