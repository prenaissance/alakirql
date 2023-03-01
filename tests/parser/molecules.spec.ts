import { describe, expect, it } from "vitest";
import lex from "../../src/lexer";
import * as M from "../../src/parser/molecules";
import { LiteralType, NodeType } from "../../src/parser/nodes";
import { TokenType } from "../../src/lexer/tokens";

describe("parser molecules", () => {
  describe("literals", () => {
    it("should parse numbers into nodes", () => {
      const result = M.numericLiteralNode.run(lex("1"));
      expect(!result.isError && result.result).toEqual({
        type: NodeType.Literal,
        kind: LiteralType.Number,
        value: 1,
      });
    });

    it("should parse strings into nodes", () => {
      const result = M.stringLiteralNode.run(lex('"str"'));
      expect(!result.isError && result.result).toEqual({
        type: NodeType.Literal,
        kind: LiteralType.String,
        value: "str",
      });
    });

    it("should parse dates into nodes", () => {
      const result = M.dateLiteralNode.run(lex("D2021-01-01"));
      expect(!result.isError && result.result).toEqual({
        type: NodeType.Literal,
        kind: LiteralType.Date,
        value: new Date("2021-01-01"),
      });
    });

    it("should parse booleans into nodes", () => {
      const result = M.booleanLiteralNode.run(lex("true"));
      expect(!result.isError && result.result).toEqual({
        type: NodeType.Literal,
        kind: LiteralType.Boolean,
        value: true,
      });
    });

    it("should parse identifiers into nodes", () => {
      const result = M.identifierNode.run(lex("a"));
      expect(!result.isError && result.result).toEqual({
        type: NodeType.Identifier,
        name: "a",
      });
    });

    describe("array literal expression", () => {
      it("should parse empty array literals", () => {
        const result = M.arrayExpressionNode.run(lex("[]"));
        expect(!result.isError && result.result).toEqual({
          type: NodeType.ArrayExpression,
          elements: [],
        });
      });

      it("should parse array literals with literal elements", () => {
        const result = M.arrayExpressionNode.run(lex("[1, 2, 3]"));
        expect(!result.isError && result.result).toEqual({
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
        const result = M.arrayExpressionNode.run(lex("[[1, 2], [3, 4]]"));
        expect(!result.isError && result.result).toEqual({
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

  describe("declarations", () => {
    it("should parse single uninitialized variable declarations", () => {
      const result = M.variableDeclarationNode.run(lex("declare a"));
      // this should error in the interpreter, but run in the parser
      const result2 = M.variableDeclarationNode.run(lex("const a"));
      expect(!result.isError && result.result).toEqual({
        type: NodeType.VariableDeclaration,
        kind: TokenType.MutableDeclaration,
        declarations: [
          {
            id: {
              type: NodeType.Identifier,
              name: "a",
            },
            init: null,
            type: NodeType.VariableDeclarator,
          },
        ],
      });

      expect(!result2.isError && result2.result).toEqual({
        type: NodeType.VariableDeclaration,
        kind: TokenType.ImmutableDeclaration,
        declarations: [
          {
            id: {
              type: NodeType.Identifier,
              name: "a",
            },
            init: null,
            type: NodeType.VariableDeclarator,
          },
        ],
      });
    });

    it("should parse single initialized variable declarations", () => {
      const result = M.variableDeclarationNode.run(lex("declare a = 1"));
      expect(!result.isError && result.result).toEqual({
        type: NodeType.VariableDeclaration,
        kind: TokenType.MutableDeclaration,
        declarations: [
          {
            id: {
              type: NodeType.Identifier,
              name: "a",
            },
            init: {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 1,
            },
            type: NodeType.VariableDeclarator,
          },
        ],
      });
    });

    it("should parse multiple variable declarations", () => {
      const result = M.variableDeclarationNode.run(
        lex("declare a = 9, b, c = D2021-01-01"),
      );
      expect(!result.isError && result.result).toEqual({
        type: NodeType.VariableDeclaration,
        kind: TokenType.MutableDeclaration,
        declarations: [
          {
            id: {
              type: NodeType.Identifier,
              name: "a",
            },
            init: {
              type: NodeType.Literal,
              kind: LiteralType.Number,
              value: 9,
            },
            type: NodeType.VariableDeclarator,
          },
          {
            id: {
              type: NodeType.Identifier,
              name: "b",
            },
            init: null,
            type: NodeType.VariableDeclarator,
          },
          {
            id: {
              type: NodeType.Identifier,
              name: "c",
            },
            init: {
              type: NodeType.Literal,
              kind: LiteralType.Date,
              value: new Date("2021-01-01"),
            },
            type: NodeType.VariableDeclarator,
          },
        ],
      });
    });
  });

  describe("expressions", () => {
    it.todo("should parser binary expressions with precedence", () => {
      ("");
    });
  });
});
