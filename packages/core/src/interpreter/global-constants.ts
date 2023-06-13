import { InnerSymbol, SymbolType } from "./symbol-types";

export const globalConstants: Record<string, InnerSymbol> = {
  PI: {
    type: SymbolType.Number,
    value: Math.PI,
  },
  ZODIAC_COLORS: {
    type: SymbolType.Object,
    value: {
      Aries: {
        type: SymbolType.String,
        value: "Red",
      },
      Taurus: {
        type: SymbolType.String,
        value: "Green",
      },
      Gemini: {
        type: SymbolType.String,
        value: "Yellow",
      },
      Cancer: {
        type: SymbolType.String,
        value: "White",
      },
      Leo: {
        type: SymbolType.String,
        value: "Gold",
      },
      Virgo: {
        type: SymbolType.String,
        value: "Navy Blue",
      },
      Libra: {
        type: SymbolType.String,
        value: "Pink",
      },
      Scorpio: {
        type: SymbolType.String,
        value: "Black",
      },
      Sagittarius: {
        type: SymbolType.String,
        value: "Purple",
      },
      Capricorn: {
        type: SymbolType.String,
        value: "Brown",
      },
      Aquarius: {
        type: SymbolType.String,
        value: "Blue",
      },
      Pisces: {
        type: SymbolType.String,
        value: "Light Green",
      },
    },
  },
};
