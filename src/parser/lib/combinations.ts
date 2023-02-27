import { ErrorHandler, Parser, ParserResult, SuccessHandler } from "./parser";

export const sequenceOf = <T>(...parsers: Parser<T>[]) => {
  return new Parser((state) => {
    const results: T[] = [];
    let currentState: ParserResult<unknown> = state;
    for (const parser of parsers) {
      const result = parser.parserStateMapper(currentState);
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
