import {
  areZodiacSignsCompatible,
  getMoonPhase,
  getZodiacEmoji,
  getZodiacSign,
} from "./astrology-lib";
import {
  ArraySymbol,
  DateSymbol,
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
    body: (arr: ArraySymbol) =>
      ({
        type: SymbolType.Number,
        value: arr.value.length,
      } as NumberSymbol),
  },

  now: {
    args: [],
    body: () => ({
      type: SymbolType.Date,
      value: new Date(),
    }),
  },

  getZodiacSign: {
    args: [SymbolType.Date],
    body: (date: DateSymbol) => ({
      type: SymbolType.String,
      value: getZodiacSign(date.value),
    }),
  },

  getZodiacEmoji: {
    args: [SymbolType.String],
    body: (str: StringSymbol) => ({
      type: SymbolType.String,
      value: getZodiacEmoji(str.value),
    }),
  },

  areZodiacSignsCompatible: {
    args: [SymbolType.String, SymbolType.String],
    body: (str1: StringSymbol, str2: StringSymbol) => ({
      type: SymbolType.Boolean,
      value: areZodiacSignsCompatible(str1.value, str2.value),
    }),
  },

  getMoonPhase: {
    args: [SymbolType.Date],
    body: (date: DateSymbol) => ({
      type: SymbolType.String,
      value: getMoonPhase(date.value),
    }),
  },
};
