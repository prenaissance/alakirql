import { describe, expect, it } from "vitest";
import lex from "@/lexer";
import * as M from "@/parser/molecules";
import { LiteralType, NodeType } from "@/parser/nodes";
import { getValue } from "@/parser/lib/parser";
import { TokenType } from "@/lexer/tokens";

describe("parser molecules -> expressions", () => {
  it("should access array index", () => {
    const result = M.indexingExpressionNode.run(lex("[0, 1][1]"));
    expect(getValue(result)).toEqual({
      type: NodeType.IndexingExpression,
      object: {
        type: NodeType.ArrayExpression,
        elements: [
          {
            type: NodeType.Literal,
            kind: LiteralType.Number,
            value: 0,
          },
          {
            type: NodeType.Literal,
            kind: LiteralType.Number,
            value: 1,
          },
        ],
      },
      index: {
        type: NodeType.Literal,
        kind: LiteralType.Number,
        value: 1,
      },
    });
  });

  it("should access nested array index", () => {
    const result = M.indexingExpressionNode.run(lex("a[1][2 + 1]"));
    expect(getValue(result)).toEqual({
      type: NodeType.IndexingExpression,
      object: {
        type: NodeType.IndexingExpression,
        object: {
          type: NodeType.Identifier,
          name: "a",
        },
        index: {
          type: NodeType.Literal,
          kind: LiteralType.Number,
          value: 1,
        },
      },
      index: {
        type: NodeType.BinaryExpression,
        operator: TokenType.Plus,
        left: {
          type: NodeType.Literal,
          kind: LiteralType.Number,
          value: 2,
        },
        right: {
          type: NodeType.Literal,
          kind: LiteralType.Number,
          value: 1,
        },
      },
    });
  });

  it("should access object property", () => {
    const result = M.memberExpressionNode.run(lex("a.b"));
    expect(getValue(result)).toEqual({
      type: NodeType.MemberExpression,
      object: {
        type: NodeType.Identifier,
        name: "a",
      },
      property: {
        type: NodeType.Identifier,
        name: "b",
      },
    });
  });

  it("should access object literal property", () => {
    const result = M.memberExpressionNode.run(lex("{a: 1}.a"));
    expect(getValue(result)).toEqual({
      type: NodeType.MemberExpression,
      object: {
        type: NodeType.ObjectExpression,
        properties: [
          {
            type: NodeType.Property,
            key: {
              type: NodeType.Identifier,
              name: "a",
            },
            value: {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 1,
            },
          },
        ],
      },
      property: {
        type: NodeType.Identifier,
        name: "a",
      },
    });
  });

  it("should access nested object property", () => {
    const result = M.memberExpressionNode.run(lex("a.b.c"));
    expect(getValue(result)).toEqual({
      type: NodeType.MemberExpression,
      object: {
        type: NodeType.MemberExpression,
        object: {
          type: NodeType.Identifier,
          name: "a",
        },
        property: {
          type: NodeType.Identifier,
          name: "b",
        },
      },
      property: {
        type: NodeType.Identifier,
        name: "c",
      },
    });
  });

  it("should call function with no arguments", () => {
    const result = M.callExpressionNode.run(lex("a()"));
    expect(getValue(result)).toEqual({
      type: NodeType.CallExpression,
      callee: {
        type: NodeType.Identifier,
        name: "a",
      },
      arguments: [],
    });
  });

  it("should call function with arguments", () => {
    const result = M.callExpressionNode.run(lex("a(1, b[2])"));
    expect(getValue(result)).toEqual({
      type: NodeType.CallExpression,
      callee: {
        type: NodeType.Identifier,
        name: "a",
      },
      arguments: [
        {
          type: NodeType.Literal,
          kind: LiteralType.Number,
          value: 1,
        },
        {
          type: NodeType.IndexingExpression,
          object: {
            type: NodeType.Identifier,
            name: "b",
          },
          index: {
            type: NodeType.Literal,
            kind: LiteralType.Number,
            value: 2,
          },
        },
      ],
    });
  });

  it("should call function with currying", () => {
    const result = M.callExpressionNode.run(lex("a(1)(2)"));
    expect(getValue(result)).toEqual({
      type: NodeType.CallExpression,
      callee: {
        type: NodeType.CallExpression,
        callee: {
          type: NodeType.Identifier,
          name: "a",
        },
        arguments: [
          {
            type: NodeType.Literal,
            kind: LiteralType.Number,
            value: 1,
          },
        ],
      },
      arguments: [
        {
          type: NodeType.Literal,
          kind: LiteralType.Number,
          value: 2,
        },
      ],
    });
  });

  it("should call a piped function", () => {
    const result = M.callExpressionNode.run(lex("a(b(c))"));
    expect(getValue(result)).toEqual({
      type: NodeType.CallExpression,
      callee: {
        type: NodeType.Identifier,
        name: "a",
      },
      arguments: [
        {
          type: NodeType.CallExpression,
          callee: {
            type: NodeType.Identifier,
            name: "b",
          },
          arguments: [
            {
              type: NodeType.Identifier,
              name: "c",
            },
          ],
        },
      ],
    });
  });
});
