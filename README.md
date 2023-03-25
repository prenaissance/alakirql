# Alakirql - DSL for Astrology

<p align="center">
  <img alt="ci workflow" src="https://github.com/prenaissance/alakirql/actions/workflows/ci.yml/badge.svg"/>
  <img alt="publish workflow" src="https://github.com/prenaissance/alakirql/actions/workflows/publish.yml/badge.svg"/>
  <a href="https://codecov.io/gh/prenaissance/alakirql" target="_blank">
    <img alt="codecov" src="https://codecov.io/gh/prenaissance/alakirql/branch/master/graph/badge.svg?token=OYGG9ZKOAF">
  </a>
  <a href="https://conventionalcommits.org" target="_blank">
    <img alt="conventional commits" src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@alakir/core">
    <img alt="npm" src="https://img.shields.io/npm/v/@alakir/core?label=%40alakir%2Fcore">
  </a>
  <a href="https://www.npmjs.com/package/@alakir/cli">
    <img alt="npm" src="https://img.shields.io/npm/v/@alakir/cli?label=%40alakir%2Fcli">
  </a>
</p>

This is a monorepo managed by [Turborepo](https://turbo.build/repo), having the following published packages:

- @alakir/core
- @alakir/cli
- _probably other tools to come_

## Installing the cli

Install the package globally with `npm i -g @alakir/cli` or `pnpm add -g @alakir/cli` and then run `alakir --help` to see the list of commands.

## Running locally

- Have Node.js 16+ installed.
- Install pnpm with `npm i -g pnpm`
- Install dependencies with `pnpm i --frozen-lockfile`
- Run `pnpm run build` to build all the packages

## Running tests

- `pnpm run test` or `pnpm run test:coverage` for coverage

## Grammar (Almost BNF)

> . - any symbol

### Keywords

- `if`, `else`, `while`, `print`, `define`, `const`

### Symbols

- `(`, `)`, `{`, `}`, `[`, `]`, `;`, `,`, `=`, `==`, `!=`, `>`, `<`, `>=`, `<=`, `+`, `-`, `*`, `/`, `%`, `:`, `.`, `!`, `&&`, `||`

### Literals

> \<digit\> ::= [`0-9`]

> \<alpha\> ::= [`a-z`] | [`A-Z`]

> \<alphanumeric\> ::= \<alpha\> | \<digit\>

- \<BooleanLiteral\> ::= `true` | `false`
- \<StringLiteral\> ::= `"` \(\.|[^"\]\)\* `"` | `'` \(\.|[^'\]\)\* `'`
- \<NumberLiteral\> ::= \(`0`|([`1-9`][`0-9`]\*)\)\(\.[0-9]+\)\?
- \<DateLiteral\> ::= `D` \<digit\><sup>4</sup> `-` \<digit\><sup>2</sup> `-` \<digit\><sup>2</sup>
- \<Identifier\> ::= \(\<alpha\>|`_`|`$`\) \(\<alphanumeric\>|`_`|`$`\)\*
- \<Literal\> ::= \<BooleanLiteral\> | \<StringLiteral\> | \<NumberLiteral\> | \<DateLiteral\> | \<Identifier\>

### Expressions

> \<binaryOperator\> ::= `+` | `-` | `*` | `/` | `%` | `==` | `!=` | `>` | `<` | `>=` | `<=` | `&&` | `||`

- \<ArrayExpression\> ::= `[` \<Expression\> (`,` \<Expression\>)\* `]`
- \<ObjectExpression\> ::= `{` \<Identifier\> `:` \<Expression\> (`,` \<Identifier\> `:` \<Expression\>)\* `}`
- \<CallExpression\> ::= \<Identifier\> `(` \<Expression\> (`,` \<Expression\>)\* `)`
- \<AssignmentExpression\> ::= \<Expression\> `=` \<Expression\>
- \<BinaryExpression\> ::= \<Expression\> \<binaryOperator\> \<Expression\> | \<AssignmentExpression\>
- \<IndexingExpression\> ::= \<Expression\> `[` \<Expression\> `]`
- \<MemberAccessExpression\> ::= \<Expression\> `.` \<Identifier\>
- \<Expression\> ::= \<Literal\> | \<ArrayExpression\> | \<ObjectExpression\> | \<CallExpression\> | \<BinaryExpression\> | \<IndexingExpression\> | \<MemberAccessExpression\>

### Statements

> \<declarator\> ::= \<Identifier\> (`=` \<Expression\>)?

- \<ExpressionStatement\> ::= \<Expression\> `;`
- \<BlockStatement\> ::= `{` \<Statement\>\* `}`
- \<IfStatement\> ::= `if` `(` \<Expression\> `)` \<Statement\> (`else` \<Statement\>)?
- \<WhileStatement\> ::= `while` `(` \<Expression\> `)` \<Statement\>
- \<PrintStatement\> ::= `print` `(` \<Expression\> `)` `;`
- \<VariableDeclaration\> ::= `const` | `declare` \<declarator\> (`,` \<declarator\>)\* `;`
- \<Statement\> ::= \<ExpressionStatement\> | \<BlockStatement\> | \<IfStatement\> | \<WhileStatement\> | \<PrintStatement\> | \<VariableDeclaration\>

### Program

- \<Program\> ::= \<Statement\>\*

## Road map

### Completed

- Lexer (Add more keywords and symbols if you want)

- Parser

  - [x] Basic keywords
  - [x] Declarations & assignments
  - [x] Binary expressions
  - [x] Expressions
  - [x] Function calls
  - [x] Control flow
  - [x] Ast generation
  - [ ] ~~Function definitions~~ _Ignored for simplicity_

### In progress

- Cli (some demo scripts are in the parser 'demo' folder)

  - [x] Read from file
  - [x] Repl
  - [x] Lex
  - [x] Parse
  - [x] Interpret
  - [ ] Maintain with new features from interpreter

- Interpreter
  - [x] Assignments and declarations
  - [x] Block scoped variables
  - [x] IO
  - [x] Predefined functions
    - [x] lucky
    - [x] len _used with arrays_
    - [ ] birth_chart
  - [x] Control flow
  - [x] Loops
  - [x] Array and objects
  - [x] Predefined functions support
  - [x] Function calls
  - [x] Indexing & property access
