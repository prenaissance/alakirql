import { describe, expect, it } from "vitest";
import lex from "@/lexer";
import * as M from "@/parser/molecules";
import { LiteralType, NodeType } from "@/parser/nodes";
import { getValue } from "@/parser/lib/parser";
import { TokenType } from "@/lexer/tokens";

describe("parser molecules -> literals", () => {
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

    it("should parse array literals with object elements", () => {
      const result = M.arrayExpressionNode.run(lex("[{a: 1, b: 2}, 3]"));
      expect(getValue(result)).toEqual({
        type: NodeType.ArrayExpression,
        elements: [
          {
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
              {
                type: NodeType.Property,
                key: {
                  type: NodeType.Identifier,
                  name: "b",
                },
                value: {
                  type: NodeType.Literal,
                  kind: LiteralType.Number,
                  value: 2,
                },
              },
            ],
          },
          {
            type: NodeType.Literal,
            kind: LiteralType.Number,
            value: 3,
          },
        ],
      });
    });

    it("should assign an array literal to a variable", () => {
      const result = M.assignmentExpressionNode.run(lex("a = [1, 2]"));
      expect(getValue(result)).toEqual({
        type: NodeType.AssignmentExpression,
        operator: TokenType.Assignment,
        left: {
          type: NodeType.Identifier,
          name: "a",
        },
        right: {
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
      });
    });
  });

  describe("object literal expression", () => {
    it("should parse empty object literals", () => {
      const result = M.objectExpressionNode.run(lex("{}"));
      expect(getValue(result)).toEqual({
        type: NodeType.ObjectExpression,
        properties: [],
      });
    });

    it("should parse object literals with simple properties", () => {
      const result = M.objectExpressionNode.run(lex("{a: 2 + 1, b: c}"));
      expect(getValue(result)).toEqual({
        type: NodeType.ObjectExpression,
        properties: [
          {
            type: NodeType.Property,
            key: {
              type: NodeType.Identifier,
              name: "a",
            },
            value: {
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
          },
          {
            type: NodeType.Property,
            key: {
              type: NodeType.Identifier,
              name: "b",
            },
            value: {
              type: NodeType.Identifier,
              name: "c",
            },
          },
        ],
      });
    });

    it("should parse object literals with nested object properties", () => {
      const result = M.objectExpressionNode.run(lex("{a: {b: 1, c: 2}, d: 3}"));
      expect(getValue(result)).toEqual({
        type: NodeType.ObjectExpression,
        properties: [
          {
            type: NodeType.Property,
            key: {
              type: NodeType.Identifier,
              name: "a",
            },
            value: {
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
                {
                  type: NodeType.Property,
                  key: {
                    type: NodeType.Identifier,
                    name: "c",
                  },
                  value: {
                    type: NodeType.Literal,
                    kind: LiteralType.Number,
                    value: 2,
                  },
                },
              ],
            },
          },
          {
            type: NodeType.Property,
            key: {
              type: NodeType.Identifier,
              name: "d",
            },
            value: {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 3,
            },
          },
        ],
      });
    });

    it("should parse object literals with array properties", () => {
      const result = M.objectExpressionNode.run(lex("{a: [1, 2, 3], b: 4}"));
      expect(getValue(result)).toEqual({
        type: NodeType.ObjectExpression,
        properties: [
          {
            type: NodeType.Property,
            key: {
              type: NodeType.Identifier,
              name: "a",
            },
            value: {
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
            },
          },
          {
            type: NodeType.Property,
            key: {
              type: NodeType.Identifier,
              name: "b",
            },
            value: {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 4,
            },
          },
        ],
      });
    });

    // Bug for now :((
    it.skip("should assign an object literal to a variable", () => {
      const result = M.assignmentExpressionNode.run(lex("a = {b: []], c: 2}"));
      expect(getValue(result)).toEqual({
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
                type: NodeType.ArrayExpression,
                elements: [],
              },
            },
            {
              type: NodeType.Property,
              key: {
                type: NodeType.Identifier,
                name: "c",
              },
              value: {
                type: NodeType.Literal,
                kind: LiteralType.Number,
                value: 2,
              },
            },
          ],
        },
      });
    });
  });
});
