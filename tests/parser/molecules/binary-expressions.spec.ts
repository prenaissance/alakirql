import { describe, expect, it } from "vitest";
import lex from "@/lexer";
import * as M from "@/parser/molecules";
import { LiteralType, NodeType } from "@/parser/nodes";
import { TokenType } from "@/lexer/tokens";
import { getValue } from "@/parser/lib/parser";

describe("parser molecules -> binary expressions", () => {
  it("should parse single multiplicative expressions", () => {
    const result = M.multiplicativeExpressionNode.run(lex("1 * 2"));
    expect(getValue(result)).toEqual({
      type: NodeType.BinaryExpression,
      operator: TokenType.Multiply,
      left: {
        type: NodeType.Literal,
        kind: LiteralType.Number,
        value: 1,
      },
      right: {
        type: NodeType.Literal,
        kind: LiteralType.Number,
        value: 2,
      },
    });
  });

  it("should parse multiplicative expressions in order", () => {
    const result = M.multiplicativeExpressionNode.run(lex("1 * 2 / 3"));
    expect(getValue(result)).toEqual({
      type: NodeType.BinaryExpression,
      operator: TokenType.Divide,
      left: {
        type: NodeType.BinaryExpression,
        operator: TokenType.Multiply,
        left: {
          type: NodeType.Literal,
          kind: LiteralType.Number,
          value: 1,
        },
        right: {
          type: NodeType.Literal,
          kind: LiteralType.Number,
          value: 2,
        },
      },
      right: {
        type: NodeType.Literal,
        kind: LiteralType.Number,
        value: 3,
      },
    });
  });

  it("should parse additive expressions in order", () => {
    const result = M.additiveExpressionNode.run(lex("1 + 2 - a"));
    expect(getValue(result)).toEqual({
      type: NodeType.BinaryExpression,
      operator: TokenType.Minus,
      left: {
        type: NodeType.BinaryExpression,
        operator: TokenType.Plus,
        left: {
          type: NodeType.Literal,
          kind: LiteralType.Number,
          value: 1,
        },
        right: {
          type: NodeType.Literal,
          kind: LiteralType.Number,
          value: 2,
        },
      },
      right: {
        type: NodeType.Identifier,
        name: "a",
      },
    });
  });

  it("should prioritize multiplicative expressions over additive", () => {
    const result = M.additiveExpressionNode.run(lex("a + b * c"));
    expect(getValue(result)).toEqual({
      type: NodeType.BinaryExpression,
      operator: TokenType.Plus,
      left: {
        type: NodeType.Identifier,
        name: "a",
      },
      right: {
        type: NodeType.BinaryExpression,
        operator: TokenType.Multiply,
        left: {
          type: NodeType.Identifier,
          name: "b",
        },
        right: {
          type: NodeType.Identifier,
          name: "c",
        },
      },
    });
  });

  it("should prioritize additive expressions in parentheses", () => {
    const result = M.additiveExpressionNode.run(lex("a + (b - a)"));
    expect(getValue(result)).toEqual({
      type: NodeType.BinaryExpression,
      operator: TokenType.Plus,
      left: {
        type: NodeType.Identifier,
        name: "a",
      },
      right: {
        type: NodeType.BinaryExpression,
        operator: TokenType.Minus,
        left: {
          type: NodeType.Identifier,
          name: "b",
        },
        right: {
          type: NodeType.Identifier,
          name: "a",
        },
      },
    });
  });

  it("should accept as many brackets as you want around parameters", () => {
    const result = M.additiveExpressionNode.run(lex("(a + (b)) - (a)"));
    const noBracketResult = M.additiveExpressionNode.run(lex("a + b - a"));
    expect(result.isError).toBe(false);
    expect(noBracketResult.isError).toBe(false);
    expect(getValue(result)).toEqual(
      !noBracketResult.isError && noBracketResult.result,
    );
  });

  it("should prioritize multiplicative expressions over comparison", () => {
    const result = M.comparisonExpressionNode.run(lex("a * b >= c"));
    expect(getValue(result)).toEqual({
      type: NodeType.BinaryExpression,
      operator: TokenType.GreaterThanOrEqual,
      left: {
        type: NodeType.BinaryExpression,
        operator: TokenType.Multiply,
        left: {
          type: NodeType.Identifier,
          name: "a",
        },
        right: {
          type: NodeType.Identifier,
          name: "b",
        },
      },
      right: {
        type: NodeType.Identifier,
        name: "c",
      },
    });
  });

  it("should prioritize comparison expressions over logical", () => {
    const result = M.logicalExpressionNode.run(lex("a >= b && c"));
    expect(getValue(result)).toEqual({
      type: NodeType.BinaryExpression,
      operator: TokenType.And,
      left: {
        type: NodeType.BinaryExpression,
        operator: TokenType.GreaterThanOrEqual,
        left: {
          type: NodeType.Identifier,
          name: "a",
        },
        right: {
          type: NodeType.Identifier,
          name: "b",
        },
      },
      right: {
        type: NodeType.Identifier,
        name: "c",
      },
    });
  });

  it("should parse single assignment expressions", () => {
    const result = M.assignmentExpressionNode.run(lex("a = b[0] + 2"));

    expect(getValue(result)).toEqual({
      type: NodeType.AssignmentExpression,
      left: {
        type: NodeType.Identifier,
        name: "a",
      },
      operator: TokenType.Assignment,
      right: {
        type: NodeType.BinaryExpression,
        operator: TokenType.Plus,
        left: {
          type: NodeType.IndexingExpression,
          object: {
            type: NodeType.Identifier,
            name: "b",
          },
          index: {
            type: NodeType.Literal,
            kind: LiteralType.Number,
            value: 0,
          },
        },
        right: {
          type: NodeType.Literal,
          kind: LiteralType.Number,
          value: 2,
        },
      },
    });
  });

  it("should parse assignment expressions in order", () => {
    const result = M.assignmentExpressionNode.run(lex("a = b = D2022-01-01"));
    expect(getValue(result)).toEqual({
      type: NodeType.AssignmentExpression,
      left: {
        type: NodeType.Identifier,
        name: "a",
      },
      operator: TokenType.Assignment,
      right: {
        type: NodeType.AssignmentExpression,
        left: {
          type: NodeType.Identifier,
          name: "b",
        },
        operator: TokenType.Assignment,
        right: {
          type: NodeType.Literal,
          kind: LiteralType.Date,
          value: new Date("2022-01-01"),
        },
      },
    });
  });
});
