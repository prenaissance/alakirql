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
      result: results,
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
        };
      }
      results.push(result.result);
      currentState = result;
    }
  });
};

export const many1 = <T>(parser: Parser<T>) =>
  sequenceOf<T[]>(
    parser.map((x) => [x]),
    many(parser),
  ).map(([first, rest]) => [...first, ...rest]);

// ! WIP, need to solve duplicated result
export const optional = <T>(parser: Parser<T>) => {
  return new Parser((state) => {
    const result = parser.parserStateMapper(state);
    return result.isError ? state : result;
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
