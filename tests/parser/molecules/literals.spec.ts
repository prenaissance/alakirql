import { describe, expect, it } from "vitest";
import lex from "@/lexer";
import * as M from "@/parser/molecules";
import { LiteralType, NodeType } from "@/parser/nodes";
import { getValue } from "@/parser/lib/parser";

describe("parser molecules -> literals", () => {
  describe("literals", () => {
    it("should parse numbers into nodes", () => {
      const result = M.numericLiteralNode.run(lex("1"));
      expect(getValue(result)).toEqual({
        type: NodeType.Literal,
        kind: LiteralType.Number,
        value: 1,
      });
    });

    it("should parse strings into nodes", () => {
      const result = M.stringLiteralNode.run(lex('"str"'));
      expect(getValue(result)).toEqual({
        type: NodeType.Literal,
        kind: LiteralType.String,
        value: "str",
      });
    });

    it("should parse dates into nodes", () => {
      const result = M.dateLiteralNode.run(lex("D2021-01-01"));
      expect(getValue(result)).toEqual({
        type: NodeType.Literal,
        kind: LiteralType.Date,
        value: new Date("2021-01-01"),
      });
    });

    it("should parse booleans into nodes", () => {
      const result = M.booleanLiteralNode.run(lex("true"));
      expect(getValue(result)).toEqual({
        type: NodeType.Literal,
        kind: LiteralType.Boolean,
        value: true,
      });
    });

    it("should parse identifiers into nodes", () => {
      const result = M.identifierNode.run(lex("a"));
      expect(getValue(result)).toEqual({
        type: NodeType.Identifier,
        name: "a",
      });
    });

    describe("array literal expression", () => {
      it("should parse empty array literals", () => {
        const result = M.arrayExpressionNode.run(lex("[]"));
        expect(getValue(result)).toEqual({
          type: NodeType.ArrayExpression,
          elements: [],
        });
      });

      it("should parse array literals with literal elements", () => {
        const result = M.arrayExpressionNode.run(lex("[1, 2, 3]"));
        expect(getValue(result)).toEqual({
          type: NodeType.ArrayExpression,
          elements: [
            {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 1,
            },
            {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 2,
            },
            {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 3,
            },
          ],
        });
      });

      it("should parse array literals with nested array elements", () => {
        const result = M.arrayExpressionNode.run(lex("[[1, 2],5, [3, 4]]"));
        expect(getValue(result)).toEqual({
          type: NodeType.ArrayExpression,
          elements: [
            {
              type: NodeType.ArrayExpression,
              elements: [
                {
                  type: NodeType.Literal,
                  kind: LiteralType.Number,
                  value: 1,
                },
                {
                  type: NodeType.Literal,
                  kind: LiteralType.Number,
                  value: 2,
                },
              ],
            },
            {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 5,
            },
            {
              type: NodeType.ArrayExpression,
              elements: [
                {
                  type: NodeType.Literal,
                  kind: LiteralType.Number,
                  value: 3,
                },
                {
                  type: NodeType.Literal,
                  kind: LiteralType.Number,
                  value: 4,
                },
              ],
            },
          ],
        });
      });
    });
  });
});
