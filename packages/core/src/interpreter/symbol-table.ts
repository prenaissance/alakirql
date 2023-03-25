import {
  AlreadyDeclaredError,
  ImmutableError,
  NotDeclaredError,
} from "./errors";
import { predefinedFunctions } from "./predefined-functions";
import {
  InnerSymbol,
  SymbolModifier,
  SymbolType,
  SymbolValue,
} from "./symbol-types";

type SymbolTable = Map<string, SymbolValue>;

export class ContextStack {
  private readonly globalContext: SymbolTable = new Map();
  private readonly stack: SymbolTable[] = [];

  constructor() {
    Object.entries(predefinedFunctions).forEach(([name, value]) => {
      this.declareSymbol(
        name,
        {
          type: SymbolType.Function,
          value,
        },
        SymbolModifier.Predefined,
      );
    });
  }

  getSymbol(name: string): InnerSymbol | null {
    const stack = this.stack.find((ctx) => ctx.has(name)) ?? this.globalContext;
    const symbol = stack.get(name);
    if (!symbol) {
      throw new NotDeclaredError(name);
    }
    return symbol.symbol;
  }

  private setSymbol(name: string, value: SymbolValue): void {
    const ctx = this.stack.find((ctx) => ctx.has(name)) ?? this.globalContext;
    const currentSymbol = ctx.get(name);
    if (!currentSymbol) {
      throw new NotDeclaredError(name);
    }
    if (
      currentSymbol.modifier === SymbolModifier.Immutable ||
      currentSymbol.modifier === SymbolModifier.Predefined
    ) {
      throw new ImmutableError(currentSymbol);
    }
    ctx.set(name, value);
  }

  setMutableSymbol(name: string, symbol: InnerSymbol) {
    this.setSymbol(name, {
      modifier: SymbolModifier.Mutable,
      symbol,
    });
  }

  declareSymbol(name: string, symbol: InnerSymbol, modifier: SymbolModifier) {
    const ctx = this.stack.length
      ? this.stack[this.stack.length - 1]
      : this.globalContext;
    if (ctx.has(name)) {
      throw new AlreadyDeclaredError(name);
    }
    ctx.set(name, {
      modifier,
      symbol,
    });
  }

  pushContext(): void {
    this.stack.push(new Map());
  }

  popContext(): void {
    this.stack.pop();
  }
}
