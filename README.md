# Alakirql - DSL for Astrology

![ci status](https://github.com/prenaissance/alakirql/actions/workflows/ci.yml/badge.svg)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

## Running locally

- Have Node.js 16+ installed.
- Install pnpm with `npm i -g pnpm`
- Install dependencies with `pnpm i --frozen-lockfile`
- Run `pnpm run build` to transpile from TypeScript to JavaScript

## Demo

While there are unit tests written, if you want to see the lexer or parser in action, you can run some scripts from the `demo` folder with fixtures. Example:

```bash
node dist/demo/lexer.js ./fixtures/control-flow.alakir
```

## Running tests

- `pnpm run test` or `pnpm run test:coverage` for coverage

## Information

This package is going to contain just the library for the parser and probably the interpreter. In the future, making a CLI and a vscode extension is desirable and these will be separate packages.

## Grammar

## Road map

### Completed

Lexer (Add more keywords and symbols if you want)

### Coming soon

- Parser

### Planned

- Interpreter / Transpiler
- Block scoped variables
- Predefined functions
- Control flow
