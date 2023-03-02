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
});
