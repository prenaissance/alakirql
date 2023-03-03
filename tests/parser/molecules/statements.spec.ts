import { describe, expect, it } from "vitest";
import lex from "@/lexer";
import * as M from "@/parser/molecules";
import { LiteralType, NodeType } from "@/parser/nodes";
import { TokenType } from "@/lexer/tokens";
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
});
