# Alakirql core - Parser and Interpreter

While there are unit tests written, if you want to see the lexer or parser in action, you can run some scripts from the `demo` folder with fixtures. Example:

> Note: Now the cli can be used for that

```bash
node dist/demo/lexer.js ./fixtures/control-flow.alakir
```

## Information

This package is going to contain just the library for the parser and probably the interpreter. It is consumed by the cli and it can be consumed by any other application without having to use a cli
