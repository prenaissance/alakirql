import { describe, expect, it } from "vitest";
import { TokenType } from "../../../src/lexer/tokens";
import lex from "../../../src/lexer";
import P from "../../../src/parser/lib";

const expressionTokens = lex("1 + 2 * 3 - 4 / 5");
const assignmentTokens = lex('a = "str"');

describe("parser atoms", () => {
  it("should parse tokens", () => {
    const result = P.token(TokenType.Number).run(expressionTokens);
    expect(result.isError).toBe(false);
    const assigmnentResult = P.token(TokenType.Identifier).run(
      assignmentTokens,
    );
    expect(assigmnentResult.isError).toBe(false);
  });

  it("should fail on unexpected tokens", () => {
    const result = P.token(TokenType.Number).run(assignmentTokens);
    expect(result.isError).toBe(true);
  });
});
