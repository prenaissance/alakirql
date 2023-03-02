import { describe, expect, it } from "vitest";
import { TokenType } from "../../../src/lexer/tokens";
import lex from "../../../src/lexer";
import P from "../../../src/parser/lib";
import { getValue } from "../../../src/parser/lib/parser";

const expressionTokens = lex("1 + 2 * 3 - 4 / 5");
const assignmentTokens = lex('a = "str"');

describe("parser atoms", () => {
  it("should parse tokens", () => {
    const result = P.token(TokenType.Number).run(expressionTokens);
    expect(result.isError).toBe(false);
    const assignmentResult = P.token(TokenType.Identifier).run(
      assignmentTokens,
    );
    expect(assignmentResult.isError).toBe(false);
  });

  it("should fail on unexpected tokens", () => {
    const result = P.token(TokenType.Number).run(assignmentTokens);
    expect(result.isError).toBe(true);
  });

  it("should parse numbers", () => {
    const result = P.number.run(expressionTokens);
    expect(result.isError).toBe(false);
    expect(getValue(result)).toBe(1);

    const failedResult = P.number.run(assignmentTokens);
    expect(failedResult.isError).toBe(true);
  });

  it("should parse strings", () => {
    const result = P.string.run(lex('"str"'));
    expect(result.isError).toBe(false);
    expect(getValue(result)).toBe("str");

    const failedResult = P.string.run(expressionTokens);
    expect(failedResult.isError).toBe(true);
  });

  it("should parse dates", () => {
    const result = P.date.run(lex("D2021-01-01"));
    expect(result.isError).toBe(false);
    expect(getValue(result)).toEqual(new Date("2021-01-01"));

    const failedResult = P.date.run(expressionTokens);
    expect(failedResult.isError).toBe(true);
  });

  it("should parse booleans", () => {
    const result = P.boolean.run(lex("true"));
    expect(result.isError).toBe(false);
    expect(getValue(result)).toBe(true);

    const failedResult = P.boolean.run(expressionTokens);
    expect(failedResult.isError).toBe(true);
  });

  it("should parse identifiers", () => {
    const result = P.identifier.run(assignmentTokens);
    expect(result.isError).toBe(false);
    expect(getValue(result)).toBe("a");

    const failedResult = P.identifier.run(expressionTokens);
    expect(failedResult.isError).toBe(true);
  });

  it.skip("should parse expressions between many brackets", () => {
    const result = P.betweenManyBrackets(P.number).run(lex("((1))"));
    expect(result.isError).toBe(false);
    expect(P.getValue(result)).toBe(1);

    const noBracketsResult = P.betweenManyBrackets(P.number).run(lex("1"));

    expect(noBracketsResult.isError).toBe(false);
    expect(P.getValue(noBracketsResult)).toBe(1);
  });

  it.skip("should parse expressions between many brackets, but at least 1", () => {
    const result = P.betweenMany1Brackets(P.number).run(lex("((1))"));
    expect(result.isError).toBe(false);
    expect(P.getValue(result)).toBe(1);

    const noBracketsResult = P.betweenMany1Brackets(P.number).run(lex("1"));

    expect(noBracketsResult.isError).toBe(true);
  });
});
