import { identity } from "@/common/utilities";
import { Token } from "@/lexer/tokens";

type ParserInitialResult = {
  tokens: Token[];
  index: number;
  isError: false;
};

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

const createParserInitialState = (tokens: Token[]): ParserInitialResult => ({
  tokens,
  index: 0,
  isError: false,
});

export class Parser<T, U = any> {
  readonly parserStateMapper: (state: ParserResult<U>) => ParserResult<T>;

  constructor(
    private readonly _parserStateMapper: (
      state: ParserResult<U>,
    ) => ParserResult<T>,
  ) {
    this.parserStateMapper = (state) => {
      if (state.tokens.length === state.index) {
        const errorState = {
          ...state,
          isError: true,
          error: `Unexpected end of input`,
        } as ParserErrorResult;
        return _parserStateMapper(errorState);
      }
      return _parserStateMapper(state);
    };
  }

  run(tokens: Token[]): ParserResult<T> {
    const state = createParserInitialState(tokens);
    // TODO: Fix this type assertion and handle initial state better
    return this.parserStateMapper(state as ParserResult<U>);
  }

  map<X>(mapper: (result: T) => X): Parser<X> {
    return new Parser<X>((state) => {
      const resultState = this.parserStateMapper(state as ParserResult<U>);
      const nextState = match<T, ParserResult<X>>(
        (parserResult) => ({
          ...parserResult,
          result: mapper(parserResult.result),
        }),
        identity,
      )(resultState);

      return nextState;
    });
  }

  chain<X>(mapper: (result: T) => Parser<X, T>): Parser<X> {
    return new Parser<X>((state) => {
      const resultState = this.parserStateMapper(state as ParserResult<U>);
      const nextState = match<T, ParserResult<X>>(
        (parserResult) =>
          mapper(parserResult.result).parserStateMapper(parserResult),
        identity,
      )(resultState);

      return nextState;
    });
  }
}
