import { identity } from "@/common/utilities";
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

export type SuccessHandler<T, U> = (parserResult: ParserSuccessResult<T>) => U;
export type ErrorHandler<U> = (parserResult: ParserErrorResult) => U;

export type ParserResult<T> = ParserSuccessResult<T> | ParserErrorResult;

export const match = <T, U>(
  successHandler: SuccessHandler<T, U>,
  errorHandler: ErrorHandler<U>,
) => {
  return (parserResult: ParserResult<T>) => {
    if (parserResult.isError) {
      return errorHandler(parserResult);
    }
    return successHandler(parserResult);
  };
};

export const getValue = <T>(parserResult: ParserResult<T>) => {
  return match<T, T | null>(
    (parserResult) => parserResult.result,
    () => null,
  )(parserResult);
};

const createParserInitialState = (tokens: Token[]): ParserResult<null> => ({
  tokens,
  index: 0,
  isError: false,
  result: null,
});

export class Parser<T> {
  constructor(
    readonly parserStateMapper: <U = null>(
      state: ParserResult<U>,
    ) => ParserResult<T>,
  ) {}

  run(tokens: Token[]): ParserResult<T> {
    const state = createParserInitialState(tokens);
    return this.parserStateMapper(state);
  }

  map<U>(mapper: (result: T) => U): Parser<U> {
    return new Parser<U>((state) => {
      const resultState = this.parserStateMapper(state);
      const nextState = match<T, ParserResult<U>>(
        (parserResult) => ({
          ...parserResult,
          result: mapper(parserResult.result),
        }),
        identity,
      )(resultState);

      return nextState;
    });
  }
}
