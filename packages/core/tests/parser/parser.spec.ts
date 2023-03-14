import { describe, expect, it } from "vitest";
import { LiteralType, NodeType } from "@/parser/nodes";
import { getValue } from "@/parser/lib/parser";
import parse from "@/parser";
import { TokenType } from "@/lexer/tokens";

describe("parser", () => {
  it("should prioritize object literals over block statements", () => {
    const result = parse("a = { b: 1 };");
    const ast = getValue(result);
    expect(ast).toEqual({
      type: NodeType.Program,
      body: [
        {
          type: NodeType.ExpressionStatement,
          expression: {
            type: NodeType.AssignmentExpression,
            operator: TokenType.Assignment,
            left: {
              type: NodeType.Identifier,
              name: "a",
            },
            right: {
              type: NodeType.ObjectExpression,
              properties: [
                {
                  type: NodeType.Property,
                  key: {
                    type: NodeType.Identifier,
                    name: "b",
                  },
                  value: {
                    type: NodeType.Literal,
                    kind: LiteralType.Number,
                    value: 1,
                  },
                },
              ],
            },
          },
        },
      ],
    });
  });
});
