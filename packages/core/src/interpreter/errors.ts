import { SymbolModifier, SymbolValue } from "./symbol-types";

export class ImmutableError extends Error {
  constructor(symbol: SymbolValue) {
    switch (symbol.modifier) {
      case SymbolModifier.Immutable:
        super(`Cannot reassign immutable symbol "${symbol.symbol.type}"`);
        break;
      case SymbolModifier.Predefined:
        super(`Cannot reassign predefined symbol "${symbol.symbol.type}"`);
        break;
    }
  }
}

export class NotDeclaredError extends Error {
  constructor(symbolName: string) {
    super(`Symbol "${symbolName}" is not declared`);
  }
}

export class AlreadyDeclaredError extends Error {
  constructor(symbolName: string) {
    super(`Symbol "${symbolName}" is already declared`);
  }
}
