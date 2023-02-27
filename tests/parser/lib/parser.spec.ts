import { describe, expect, it } from "vitest";
import { TokenType } from "../../../src/lexer/tokens";
import lex from "../../../src/lexer";
import P from "../../../src/parser/lib";
import { getValue } from "../../../src/parser/lib/parser";

const expressionTokens = lex("1 + 2 * 3 - 4 / 5");

describe("parser lib", () => {
  it("should map parser results", () => {
    const parser = P.string
      .map((value) => value + "b")
      .map((value) => value + "c")
      .map((value) => value + "d");
    const result = parser.run(lex('"aAa"'));
    expect(result.isError).toBe(false);
    expect(getValue(result)).toBe("aAabcd");
  });

  it("should stop propagation of map on errors", () => {
    let sideEffect = false;

    const parser = P.string
      .map((value) => {
        sideEffect = true;
        return value + "b";
      })
      .map((value) => value + "c");

    const result = parser.run(lex("123"));
    expect(result.isError).toBe(true);
    expect(sideEffect).toBe(false);
  });
});
