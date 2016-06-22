# untrust

`$ npm install --save untrust`

```js
let untrust = require('untrust');
```

Run and communicate with untrusted javascript code through DSLs you define.

Use this module to run code in a sandbox. Define an object to provide to the sandboxed code as the global. Your global object creation runs in the same process as the sandboxed code (which is not the same process as the rest of your code), so serialization does not limit how you interact with the sandboxed code.

## Defining a DSL
(Documentation incomplete.)

To understand how to use this module before this documentation gets completed, read the tests (located in test/test.js).

## API
### untrust.run(dsl_path, code[, arg])
  runs `code` in a sandbox, where `dsl_path` first creates its global object.

  `dsl_path`: an absolute path to a javascript file containing your dsl code.

  `code`: a string containing the code to run in a sandbox.

  returns: a `DownwardConnection` object.

### Connection
#### Event: 'message'
#### Event: 'request'
#### conn.request(arg)
#### conn.send(arg)
### DownwardConnection
extends `Connection`.
#### Event: 'exit'
#### Event: 'error'
#### dc.kill()
#### dc.pid
#### dc.alive
### UpwardConnection
extends `Connection`.
#### uc.error(err)