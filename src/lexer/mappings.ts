import { Input, createInput } from "@/common/input";
import { LexingError } from "./errors";
import { Token, TokenType } from "./tokens";

export const keywordMap = new Map<string, TokenType>([
  ["declare", TokenType.MutableDeclaration],
  ["const", TokenType.ImmutableDeclaration],
  ["def", TokenType.DefineFunction],
  ["return", TokenType.Return],
  ["print", TokenType.Print],
  ["if", TokenType.If],
  ["else", TokenType.Else],
]);

export const symbolMap = new Map<string, TokenType>([
  ["\n", TokenType.LineBreak],
  [":", TokenType.Colon],
  [";", TokenType.Semicolon],
  ["{", TokenType.OpenCurlyBracket],
  ["}", TokenType.CloseCurlyBracket],
  ["[", TokenType.OpenSquareBracket],
  ["]", TokenType.CloseSquareBracket],
  ["(", TokenType.OpenBracket],
  [")", TokenType.CloseBracket],
  [",", TokenType.Comma],
  ["=", TokenType.Assignment],
  ["+", TokenType.Plus],
  ["-", TokenType.Minus],
  ["*", TokenType.Multiply],
  ["/", TokenType.Divide],
  ["%", TokenType.Modulo],
  ["^", TokenType.Exponent],
  ["==", TokenType.Equal],
  ["!=", TokenType.NotEqual],
  [">", TokenType.GreaterThan],
  [">=", TokenType.GreaterThanOrEqual],
  ["<", TokenType.LessThan],
  ["<=", TokenType.LessThanOrEqual],
  ["&&", TokenType.And],
  ["||", TokenType.Or],
  ["!", TokenType.Not],
]);

export const getLookahead = (input: Input, match: RegExp) => {
  const lookahead = input.input.slice(input.index);
  const matched = lookahead.match(match);
  if (!matched) {
    return null;
  }
  const [word] = matched;
  return word;
};

export const getKeyword = (input: Input) => {
  const lookahead = input.input.slice(input.index);
  const match = [...keywordMap.entries()].find(([keyword]) =>
    lookahead.startsWith(keyword),
  );
  if (!match) {
    return null;
  }
  const [word, type] = match;
  const nextInput = createInput(input.input, input.index + word.length);
  return [
    nextInput,
    {
      type: type,
      meta: {
        index: input.index,
      },
    } as Token,
  ] as const;
};

export const getBoolean = (input: Input) => {
  const word = getLookahead(input, /^(true|false)(?![a-zA-Z0-9$_])/);
  if (!word) {
    return null;
  }
  const nextInput = createInput(input.input, input.index + word.length);
  return [
    nextInput,
    {
      type: TokenType.Boolean,
      value: word === "true",
      meta: {
        index: input.index,
      },
    } as Token,
  ] as const;
};

export const getSymbol = (input: Input) => {
  const char = input.input[input.index];
  const lookaheadSymbol = input.input.slice(input.index, input.index + 2);
  const isCharMatch = symbolMap.has(char);
  const isLookaheadMatch = symbolMap.has(lookaheadSymbol);
  if (!isCharMatch && !isLookaheadMatch) {
    return null;
  }

  return [
    createInput(
      input.input,
      isLookaheadMatch ? input.index + 2 : input.index + 1,
    ),
    {
      type: symbolMap.get(isLookaheadMatch ? lookaheadSymbol : char)!,
      meta: {
        index: input.index,
      },
    } as Token,
  ] as const;
};

export const getStringLiteral = (input: Input) => {
  const word = getLookahead(input, /^("[^"]*")|('[^']*')/);
  if (!word) {
    return null;
  }
  const value = word.slice(1, -1);
  const nextInput = createInput(input.input, input.index + word.length);
  return [
    nextInput,
    {
      type: TokenType.String,
      value,
      meta: {
        index: input.index,
      },
    } as Token,
  ] as const;
};

export const getNumberLiteral = (input: Input) => {
  let word = getLookahead(input, /^\d+/);
  if (!word) {
    return null;
  }
  const isFloat = input.input[input.index + word.length] === ".";
  if (isFloat) {
    word += input.input[input.index + word.length];
    word += getLookahead(input, /^\d+/);
  }
  const value = Number(word);
  const nextInput = createInput(input.input, input.index + word.length);
  return [
    nextInput,
    {
      type: TokenType.Number,
      value,
      meta: {
        index: input.index,
      },
    } as Token,
  ] as const;
};

export const getDateLiteral = (input: Input) => {
  const word = getLookahead(input, /^D\d{4}-\d{2}-\d{2}/);
  if (!word) {
    return null;
  }
  const value = new Date(word.slice(1));
  const nextInput = createInput(input.input, input.index + word.length);
  return [
    nextInput,
    {
      type: TokenType.Date,
      value,
      meta: {
        index: input.index,
      },
    } as Token,
  ] as const;
};

export const getIdentifier = (input: Input) => {
  const word = getLookahead(input, /^[a-zA-Z_$][a-zA-Z0-9_$]*/);
  if (!word) {
    return null;
  }
  const nextInput = createInput(input.input, input.index + word.length);
  return [
    nextInput,
    {
      type: TokenType.Identifier,
      value: word,
      meta: {
        index: input.index,
      },
    } as Token,
  ] as const;
};
