import {
  ArraySymbol,
  NumberSymbol,
  PredefinedFunction,
  StringSymbol,
  SymbolType,
} from "./symbol-types";

export const predefinedFunctions: Record<string, PredefinedFunction> = {
  lucky: {
    args: [SymbolType.String],
    body: (str: StringSymbol) => {
      const hash =
        str.value.split("").reduce((acc, char) => {
          return acc + char.charCodeAt(0);
        }, 0) % 24;

      return {
        type: SymbolType.Number,
        value: hash,
      } as NumberSymbol;
    },
  },

  len: {
    args: [SymbolType.Array],
    body: (arr: ArraySymbol) => {
      return {
        type: SymbolType.Number,
        value: arr.value.length,
      } as NumberSymbol;
    },
  },
};
