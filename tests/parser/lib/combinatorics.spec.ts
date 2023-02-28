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

  it("should parse unions of tokens", () => {
    const parser = P.oneOf(P.token(TokenType.Number), P.token(TokenType.Plus));
    expect(parser.run(lex("123")).isError).toBe(false);
    expect(parser.run(lex("+")).isError).toBe(false);
    expect(parser.run(lex("a")).isError).toBe(true);
  });

  it.skip("should parse optional tokens", () => {
    const optionalNumberParser = P.optional(P.token(TokenType.Number));
    const plusParser = P.token(TokenType.Plus);
    const parser = P.sequenceOf(plusParser, optionalNumberParser);
    const onePlusResult = parser.run(lex("+ 1"));
    expect(onePlusResult.isError).toBe(false);
    expect(onePlusResult.index).toBe(2);

    const plusResult = parser.run(lex("+ variable"));
    console.log(plusResult);
    expect(plusResult.isError).toBe(false);
    expect(plusResult.index).toBe(1);
  });

  it("should parse zero or more tokens with 'many'", () => {
    const parser = P.many(P.token(TokenType.Number));
    const result = parser.run(lex("123 456 789"));
    expect(result.isError).toBe(false);
    expect(result.index).toBe(3);

    const emptyResult = parser.run(lex("a"));
    expect(emptyResult.isError).toBe(false);
    expect(emptyResult.index).toBe(0);
  });

  it("should parse one or more tokens with 'many1'", () => {
    const parser = P.many1(P.token(TokenType.Number));
    const result = parser.run(lex("123 456 789"));
    expect(result.isError).toBe(false);
    expect(result.index).toBe(3);

    const emptyResult = parser.run(lex("a"));
    expect(emptyResult.isError).toBe(true);
  });

  it("should parser tokens with between", () => {
    const parser = P.between(
      P.token(TokenType.OpenBracket),
      P.token(TokenType.CloseBracket),
    )(P.number);
    const result = parser.run(lex("(123)"));
    expect(result.isError).toBe(false);
    expect(result.index).toBe(3);
    expect(!result.isError && result.result).toBe(123);
  });
});
