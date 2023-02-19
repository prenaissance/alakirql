import { expect, describe, it } from "vitest";

import lex from "../src/lexer";
import { TokenType } from "../src/lexer/tokens";
import { LexingError } from "../src/lexer/errors";

describe("lexer", () => {
  it("should lex mathematical expressions", () => {
    const expression = "1 + 2 * 3 - 4 / 5";
    const expectedTokens = [
      {
        type: TokenType.Number,
        value: 1,
        meta: {
          index: 0,
        },
      },
      {
        type: TokenType.Plus,
        meta: {
          index: 2,
        },
      },
      {
        type: TokenType.Number,
        value: 2,
        meta: {
          index: 4,
        },
      },
      {
        type: TokenType.Multiply,
        meta: {
          index: 6,
        },
      },
      {
        type: TokenType.Number,
        value: 3,
        meta: {
          index: 8,
        },
      },
      {
        type: TokenType.Minus,
        meta: {
          index: 10,
        },
      },
      {
        type: TokenType.Number,
        value: 4,
        meta: {
          index: 12,
        },
      },
      {
        type: TokenType.Divide,
        meta: {
          index: 14,
        },
      },
      {
        type: TokenType.Number,
        value: 5,
        meta: {
          index: 16,
        },
      },
    ];
    const tokens = lex(expression);
    expect(tokens).toEqual(expectedTokens);
  });

  it("should lex string literals", () => {
    const expression = '"hello world"';
    const expectedTokens = [
      {
        type: TokenType.String,
        value: "hello world",
        meta: {
          index: 0,
        },
      },
    ];
    const tokens = lex(expression);
    expect(tokens).toEqual(expectedTokens);
  });

  it("should lex date literals", () => {
    const expression = "D2021-01-01";
    const expectedTokens = [
      {
        type: TokenType.Date,
        value: new Date("2021-01-01"),
        meta: {
          index: 0,
        },
      },
    ];
    const tokens = lex(expression);
    expect(tokens).toEqual(expectedTokens);
  });

  it("should lex boolean literals", () => {
    const expression = "true";
    const expectedTokens = [
      {
        type: TokenType.Boolean,
        value: true,
        meta: {
          index: 0,
        },
      },
    ];
    const tokens = lex(expression);
    expect(tokens).toEqual(expectedTokens);
  });

  it("should lex boolean arithmetic", () => {
    const expression = "true && false || true";
    const expectedTokens = [
      {
        type: TokenType.Boolean,
        value: true,
        meta: {
          index: 0,
        },
      },
      {
        type: TokenType.And,
        meta: {
          index: 5,
        },
      },
      {
        type: TokenType.Boolean,
        value: false,
        meta: {
          index: 8,
        },
      },
      {
        type: TokenType.Or,
        meta: {
          index: 14,
        },
      },
      {
        type: TokenType.Boolean,
        value: true,
        meta: {
          index: 17,
        },
      },
    ];
    const tokens = lex(expression);
    expect(tokens).toEqual(expectedTokens);
  });

  it("should lex comparisons", () => {
    const expression = "1 >= 2 && 3 < 4";
    const expectedTokens = [
      {
        type: TokenType.Number,
        value: 1,
        meta: {
          index: 0,
        },
      },
      {
        type: TokenType.GreaterThanOrEqual,
        meta: {
          index: 2,
        },
      },
      {
        type: TokenType.Number,
        value: 2,
        meta: {
          index: 5,
        },
      },
      {
        type: TokenType.And,
        meta: {
          index: 7,
        },
      },
      {
        type: TokenType.Number,
        value: 3,
        meta: {
          index: 10,
        },
      },
      {
        type: TokenType.LessThan,
        meta: {
          index: 12,
        },
      },
      {
        type: TokenType.Number,
        value: 4,
        meta: {
          index: 14,
        },
      },
    ];
    const tokens = lex(expression);
    expect(tokens).toEqual(expectedTokens);
  });

  it("should lex control flow", () => {
    const expression = "if (true) { print 'hello world' } else { print 2 }";
    const expectedTokens = [
      {
        type: TokenType.If,
        meta: {
          index: 0,
        },
      },
      {
        type: TokenType.OpenBracket,
        meta: {
          index: 3,
        },
      },
      {
        type: TokenType.Boolean,
        value: true,
        meta: {
          index: 4,
        },
      },
      {
        type: TokenType.CloseBracket,
        meta: {
          index: 8,
        },
      },
      {
        type: TokenType.OpenCurlyBracket,
        meta: {
          index: 10,
        },
      },
      {
        type: TokenType.Print,
        meta: {
          index: 12,
        },
      },
      {
        type: TokenType.String,
        value: "hello world",
        meta: {
          index: 18,
        },
      },
      {
        type: TokenType.CloseCurlyBracket,
        meta: {
          index: 32,
        },
      },
      {
        type: TokenType.Else,
        meta: {
          index: 34,
        },
      },
      {
        type: TokenType.OpenCurlyBracket,
        meta: {
          index: 39,
        },
      },
      {
        type: TokenType.Print,
        meta: {
          index: 41,
        },
      },
      {
        type: TokenType.Number,
        value: 2,
        meta: {
          index: 47,
        },
      },
      {
        type: TokenType.CloseCurlyBracket,
        meta: {
          index: 49,
        },
      },
    ];
    const tokens = lex(expression);
    expect(tokens).toEqual(expectedTokens);
  });

  it("should throw error on invalid identifier", () => {
    const expression = "const as&b = 1";
    expect(() => lex(expression)).toThrowError(new LexingError("&b", 8));
  });
});
