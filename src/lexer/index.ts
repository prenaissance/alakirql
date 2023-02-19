import { createInput } from "@/common/input";
import { Input } from "@/common/input";
import { Token } from "./tokens";
import {
  getBoolean,
  getDateLiteral,
  getIdentifier,
  getKeyword,
  getNumberLiteral,
  getStringLiteral,
  getSymbol,
} from "./mappings";
import { LexingError } from "./errors";

const isIgnore = (char: string) => char !== "\n" && char.match(/\s+/);

const getFirstMatch =
  (...fns: ((input: Input) => Readonly<[Input, Token]> | null)[]) =>
  (input: Input) => {
    for (const fn of fns) {
      const result = fn(input);
      if (result) {
        return result;
      }
    }
    return null;
  };

const getLookaheadToken = getFirstMatch(
  getSymbol,
  getKeyword,
  getBoolean,
  getDateLiteral,
  getNumberLiteral,
  getStringLiteral,
  getIdentifier,
);

function getNextToken(input: Input): Readonly<[Input, Token]> {
  const char = input.input[input.index];
  // dry out if you want
  if (isIgnore(char)) {
    return getNextToken(createInput(input.input, input.index + 1));
  }
  const lookaheadToken = getLookaheadToken(input);
  if (lookaheadToken) {
    return lookaheadToken;
  }

  const errorWord = input.input.slice(
    input.index,
    input.input.slice(input.index).search(/\s/) + input.index,
  );

  throw new LexingError(errorWord, input.index);
}

function lex(sentence: string): Token[] {
  const tokens: Token[] = [];
  let input = createInput(sentence);

  while (input.index < input.input.length) {
    const [nextInput, token] = getNextToken(input);
    tokens.push(token);
    input = nextInput;
  }

  return tokens;
}

export default lex;
