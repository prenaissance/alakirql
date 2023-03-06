import { Parser, ParserResult } from "./parser";

export const sequenceOf = <T>(...parsers: Parser<T, unknown>[]) => {
  return new Parser<T[]>((state) => {
    const results: T[] = [];
    let currentState: ParserResult<T> = state as ParserResult<T>;
    for (const parser of parsers) {
      const result = parser.parserStateMapper(currentState as ParserResult<T>);
      if (result.isError) {
        return result;
      }
      results.push(result.result);
      currentState = result;
    }
    return {
      ...currentState,
      result: results.filter((x) => x !== undefined && x !== null),
    };
  });
};

export const oneOf = <T>(...parsers: Parser<T>[]) => {
  return new Parser((state) => {
    const states = parsers.map((parser) => parser.parserStateMapper(state));
    const successState = states.find((state) => !state.isError);
    return successState
      ? successState
      : {
          ...state,
          isError: true,
          error: `No parser matched at index ${state.index}`,
        };
  });
};

export const except = <T>(parser: Parser<T>, ...parsers: Parser<T>[]) => {
  return new Parser((state) => {
    const states = parsers.map((parser) => parser.parserStateMapper(state));
    const successState = states.find((state) => !state.isError);
    return successState
      ? {
          ...state,
          isError: true,
          error: `Parser matched at index ${state.index}`,
        }
      : parser.parserStateMapper(state);
  });
};

export const many = <T>(parser: Parser<T>) => {
  return new Parser<T[]>((state) => {
    const results: T[] = [];
    let currentState: ParserResult<T> = state as ParserResult<T>;
    while (true) {
      const result = parser.parserStateMapper(currentState);

      if (result.isError) {
        return {
          ...currentState,
          result: results,
          isError: false,
          error: undefined,
        };
      }
      results.push(result.result);
      currentState = result;
    }
  });
};

export const many1 = <T>(parser: Parser<T>) =>
  parser.chain((first) => many(parser).map((rest) => [first, ...rest]));

export const optional = <T>(parser: Parser<T>) => {
  return new Parser<T | null>((state) => {
    const result = parser.parserStateMapper(state);
    return result.isError
      ? {
          ...state,
          result: null,
          isError: false,
          error: undefined,
        }
      : result;
  });
};

export const between =
  <T, U>(open: Parser<T>, close: Parser<U>) =>
  <V>(parser: Parser<V>) => {
    return sequenceOf<T | U | V>(open, parser, close).map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, result, __]) => result as V,
    );
  };

export const sepBy1 = <T, U>(parser: Parser<T>, separator: Parser<U>) =>
  sequenceOf(
    many(sequenceOf<T | U>(parser, separator).map((x) => x[0] as T)),
    parser.map((x) => [x]),
  ).map(([results, last]) => [...results, ...last]);

export const sepBy = <T, U>(parser: Parser<T>, separator: Parser<U>) =>
  optional(sepBy1(parser, separator)).map((x) => x ?? []);

export const lazy = <T>(parserThunk: () => Parser<T>) => {
  return new Parser<T>((state) => {
    const parser = parserThunk();
    return parser.parserStateMapper(state);
  });
};
