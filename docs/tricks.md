# #01 Using the built-in logger

SRocket can provide you with alot of debug information if you define this enviroment variable

`process.env["DEBUG"] = "srocket:*"`

Internally SRocket uses the [debug](https://www.npmjs.com/package/debug) library.

# #02 Managing the LogLevel {docsify-ignore}

By default the log-level of srocket is set to `INFO` but you can adjust it, by using

```ts
SRocket.setLogLevel(LogLevel.Debug);
```

Use this to get all log output that srocket prints.
