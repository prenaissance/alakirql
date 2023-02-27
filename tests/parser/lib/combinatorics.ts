import { describe, expect, it } from "vitest";
import { TokenType } from "../../../src/lexer/tokens";
import lex from "../../../src/lexer";
import P from "../../../src/parser/lib";

const expressionTokens = lex("1 + 2 * 3 - 4 / 5");

describe("parser combinatorics", () => {
  it("should parse sequences of tokens", () => {
    const parser = P.sequenceOf(
      P.token(TokenType.Number),
      P.token(TokenType.Plus),
      P.token(TokenType.Number),
    );
    const result = parser.run(expressionTokens);
    expect(result.isError).toBe(false);
  });

  it("should fail on unexpected sequence tokens", () => {
    const parser = P.sequenceOf(
      P.token(TokenType.Number),
      P.token(TokenType.Minus),
      P.token(TokenType.Number),
    );
    const result = parser.run(lex("1 + 2 * 3 - 4 / 5 + 6"));
    expect(result.isError).toBe(true);
    expect(result.index).toBe(1);
  });
});
