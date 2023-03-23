import {
  AlreadyDeclaredError,
  ImmutableError,
  NotDeclaredError,
} from "./errors";

export enum SymbolModifier {
  Immutable = "Immutable",
  Mutable = "Mutable",
  Predefined = "Predefined",
}

export enum SymbolType {
  Number = "Number",
  String = "String",
  Boolean = "Boolean",
  Date = "Date",
  Function = "Function",
  Array = "Array",
  Object = "Object",
  Null = "Null",
}

type UninitializedSymbol = {
  type: SymbolType.Null;
  value: null;
};

type ArraySymbol = {
  type: SymbolType.Array;
  value: InnerSymbol[];
};

type ObjectSymbol = {
  type: SymbolType.Object;
  value: Record<string, InnerSymbol>;
};

type StringSymbol = {
  type: SymbolType.String;
  value: string;
};

type NumberSymbol = {
  type: SymbolType.Number;
  value: number;
};

type BooleanSymbol = {
  type: SymbolType.Boolean;
  value: boolean;
};

type DateSymbol = {
  type: SymbolType.Date;
  value: Date;
};

type FunctionSymbol = {
  type: SymbolType.Function;
  value: (args: any[]) => any;
};

export type InnerSymbol =
  | UninitializedSymbol
  | StringSymbol
  | NumberSymbol
  | BooleanSymbol
  | DateSymbol
  | FunctionSymbol
  | ArraySymbol
  | ObjectSymbol;

export type SymbolValue = {
  modifier: SymbolModifier;
  symbol: InnerSymbol;
};

type SymbolTable = Map<string, SymbolValue>;

export class ContextStack {
  private readonly globalContext: SymbolTable = new Map();
  private readonly stack: SymbolTable[] = [];

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
