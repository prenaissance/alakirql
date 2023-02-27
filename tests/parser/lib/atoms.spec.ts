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
});
