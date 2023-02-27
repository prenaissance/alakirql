import { Token } from "@/lexer/tokens";

type ParserSuccessResult<T> = {
  tokens: Token[];
  index: number;
  isError: false;
  result: T;
};

type ParserErrorResult = {
  tokens: Token[];
  index: number;
  isError: true;
  error: string;
};

export type ParserResult<T> = ParserSuccessResult<T> | ParserErrorResult;

const createParserInitialState = (tokens: Token[]): ParserResult<null> => ({
  tokens,
  index: 0,
  isError: false,
  result: null,
});

export class Parser<T> {
  constructor(
    readonly parserStateMapper: (state: ParserResult<any>) => ParserResult<T>,
  ) {}

  run(tokens: Token[]): ParserResult<T> {
    const state = createParserInitialState(tokens);
    return this.parserStateMapper(state);
  }

  map<U>(mapper: (result: T) => U): Parser<U> {
    return new Parser((state) => {
      const result = this.parserStateMapper(state);
      if (result.isError) {
        return result;
      }
      return {
        ...result,
        result: mapper(result.result),
      };
    });
  }
}
