import { describe, expect, it } from "vitest";
import { TokenNode, TokenType } from "../../../src/lexer/tokens";
import lex from "../../../src/lexer";
import P from "../../../src/parser/lib";

const expressionTokens = lex("1 + 2 * 3 - 4 / 5");
const inArray = P.between(
  P.token(TokenType.OpenSquareBracket),
  P.token(TokenType.CloseSquareBracket),
);

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

  it("should parse optional tokens", () => {
    const optionalNumberParser = P.optional(P.token(TokenType.Number));
    const plusParser = P.token(TokenType.Plus);
    const parser = P.sequenceOf(plusParser, optionalNumberParser);
    const onePlusResult = parser.run(lex("+ 1"));
    expect(onePlusResult.isError).toBe(false);
    expect(onePlusResult.index).toBe(2);

    const plusResult = parser.run(lex("+ variable"));
    expect(plusResult.isError).toBe(false);
    expect(plusResult.index).toBe(1);
  });

  it("should parse exactly 1 token with 'many'", () => {
    const parser = P.many(P.token(TokenType.Number));
    const result = parser.run(lex("123"));
    expect(result.isError).toBe(false);
    expect(result.index).toBe(1);
  });

  it("should parse zero or more tokens with 'many'", () => {
    const parser = P.many(P.token(TokenType.Number));
    const result = parser.run(lex("123 456 789"));
    expect(result.isError).toBe(false);
    expect(result.index).toBe(3);

    const emptyResult = parser.run(lex("a"));
    expect(emptyResult.isError).toBe(false);
    expect(!emptyResult.isError && emptyResult.result).toEqual([]);
    expect(emptyResult.index).toBe(0);

    const alsoEmptyResult = parser.run(lex(""));
    expect(alsoEmptyResult.isError).toBe(false);
    expect(!alsoEmptyResult.isError && alsoEmptyResult.result).toEqual([]);
  });

  it("should parse exactly 1 token with many1", () => {
    const parser = P.many1(P.token(TokenType.Number));
    const result = parser.run(lex("123"));
    expect(result.isError).toBe(false);
    expect(result.index).toBe(1);

    const emptyResult = parser.run(lex("a"));
    expect(emptyResult.isError).toBe(true);
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

  it("should parse separated tokens for array literals", () => {
    const parser = inArray(P.sepBy(P.number, P.token(TokenType.Comma)));

    const result = parser.run(lex("[1, 2, 3]"));
    expect(result.isError).toBe(false);
    expect(!result.isError && result.result).toEqual([1, 2, 3]);

    const emptyResult = parser.run(lex("[]"));
    expect(emptyResult.isError).toBe(false);
    expect(!emptyResult.isError && emptyResult.result).toEqual([]);

    const trailingCommaErrorResult = parser.run(lex("[1, 2, 3,]"));
    expect(trailingCommaErrorResult.isError).toBe(true);
  });

  it("should parse separated tokens (1 +) for variable declarations", () => {
    const parser = P.sequenceOf(
      P.token(TokenType.MutableDeclaration),
      P.sepBy1(
        P.oneOf(
          P.sequenceOf(
            P.token(TokenType.Identifier),
            P.token(TokenType.Assignment),
            P.number,
          ),
          P.token(TokenType.Identifier),
        ),
        P.token(TokenType.Comma),
      ),
    );

    const result = parser.run(lex("declare a = 1, b, c = 2"));
    expect(result.isError).toBe(false);
    const result2 = parser.run(lex("declare b"));
    expect(result2.isError).toBe(false);
    const errorResult = parser.run(lex("declare"));

    expect(errorResult.isError).toBe(true);
  });

  it("should parse contextually with 'chain", () => {
    const parser = P.oneOf<
      TokenNode<TokenType.LessThan> | TokenNode<TokenType.GreaterThan>
    >(P.token(TokenType.LessThan), P.token(TokenType.GreaterThan)).chain(
      ({ type }) => {
        switch (type) {
          case TokenType.LessThan:
            return P.number.map((n) => `less than ${n}`);

          case TokenType.GreaterThan:
            return P.number.map((n) => `greater than ${n}`);
        }
      },
    );

    const result = parser.run(lex("< 1"));
    expect(!result.isError && result.result).toBe("less than 1");
    expect(result.index).toBe(2);

    const result2 = parser.run(lex("> 1"));
    expect(!result2.isError && result2.result).toBe("greater than 1");
    expect(result2.index).toBe(2);

    const errorResult = parser.run(lex("= 1"));
    expect(errorResult.isError).toBe(true);
  });
});
