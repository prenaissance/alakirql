import { describe, expect, it } from "vitest";
import lex from "@/lexer";
import * as M from "@/parser/molecules";
import { LiteralType, NodeType } from "@/parser/nodes";
import { getValue } from "@/parser/lib/parser";

describe("parser molecules -> statements", () => {
  it("should parse print statements", () => {
    const result = M.printStatementNode.run(lex("print 1;"));
    expect(getValue(result)).toEqual({
      type: NodeType.PrintStatement,
      expression: {
        type: NodeType.Literal,
        kind: LiteralType.Number,
        value: 1,
      },
    });
  });

  it("should parse expression statements", () => {
    const result = M.expressionStatementNode.run(lex("1;"));
    expect(getValue(result)).toEqual({
      type: NodeType.ExpressionStatement,
      expression: {
        type: NodeType.Literal,
        kind: LiteralType.Number,
        value: 1,
      },
    });
  });

  it("should parse function calls as expression statements", () => {
    const result = M.expressionStatementNode.run(lex("foo();"));
    expect(getValue(result)).toEqual({
      type: NodeType.ExpressionStatement,
      expression: {
        type: NodeType.CallExpression,
        callee: {
          type: NodeType.Identifier,
          name: "foo",
        },
        arguments: [],
      },
    });
  });

  it("should parse if statements", () => {
    const result = M.ifStatementNode.run(lex("if (true) { 1; }"));
    expect(getValue(result)).toEqual({
      type: NodeType.IfStatement,
      test: {
        type: NodeType.Literal,
        kind: LiteralType.Boolean,
        value: true,
      },
      consequent: {
        type: NodeType.BlockStatement,
        body: [
          {
            type: NodeType.ExpressionStatement,
            expression: {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 1,
            },
          },
        ],
      },
      alternate: null,
    });
  });

  it("should parse if else statements", () => {
    const result = M.ifStatementNode.run(
      lex('if (true) { 1; } else { print "else"; }'),
    );
    expect(getValue(result)).toEqual({
      type: NodeType.IfStatement,
      test: {
        type: NodeType.Literal,
        kind: LiteralType.Boolean,
        value: true,
      },
      consequent: {
        type: NodeType.BlockStatement,
        body: [
          {
            type: NodeType.ExpressionStatement,
            expression: {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 1,
            },
          },
        ],
      },
      alternate: {
        type: NodeType.BlockStatement,
        body: [
          {
            type: NodeType.PrintStatement,
            expression: {
              type: NodeType.Literal,
              kind: LiteralType.String,
              value: "else",
            },
          },
        ],
      },
    });
  });

  it("should parse else if statements", () => {
    const result = M.ifStatementNode.run(
      lex("if (true) { 1; } else if (false) { 2; }"),
    );
    expect(getValue(result)).toEqual({
      type: NodeType.IfStatement,
      test: {
        type: NodeType.Literal,
        kind: LiteralType.Boolean,
        value: true,
      },
      consequent: {
        type: NodeType.BlockStatement,
        body: [
          {
            type: NodeType.ExpressionStatement,
            expression: {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 1,
            },
          },
        ],
      },
      alternate: {
        type: NodeType.IfStatement,
        test: {
          type: NodeType.Literal,
          kind: LiteralType.Boolean,
          value: false,
        },
        consequent: {
          type: NodeType.BlockStatement,
          body: [
            {
              type: NodeType.ExpressionStatement,
              expression: {
                type: NodeType.Literal,
                kind: LiteralType.Number,
                value: 2,
              },
            },
          ],
        },
        alternate: null,
      },
    });
  });

  it("should parse while statements", () => {
    const result = M.whileStatementNode.run(lex("while (true) { 1; }"));
    expect(getValue(result)).toEqual({
      type: NodeType.WhileStatement,
      test: {
        type: NodeType.Literal,
        kind: LiteralType.Boolean,
        value: true,
      },
      body: {
        type: NodeType.BlockStatement,
        body: [
          {
            type: NodeType.ExpressionStatement,
            expression: {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 1,
            },
          },
        ],
      },
    });
  });
});
