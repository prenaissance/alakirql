import { describe, expect, it } from "vitest";
import lex from "@/lexer";
import * as M from "@/parser/molecules";
import { LiteralType, NodeType } from "@/parser/nodes";
import { TokenType } from "@/lexer/tokens";
import { getValue } from "@/parser/lib/parser";

describe("parser molecules -> declarations", () => {
  describe("declarations", () => {
    it("should parse single uninitialized variable declarations", () => {
      const result = M.variableDeclarationNode.run(lex("declare a"));
      // this should error in the interpreter, but run in the parser
      const result2 = M.variableDeclarationNode.run(lex("const a"));
      expect(getValue(result)).toEqual({
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
      expect(getValue(result)).toEqual({
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
      expect(getValue(result)).toEqual({
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
});
