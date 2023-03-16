import { NodeType, VariableDeclaration } from "@/parser/nodes";

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
}

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

export type SymbolValue = {
  modifier: SymbolModifier;
  symbol:
    | StringSymbol
    | NumberSymbol
    | BooleanSymbol
    | DateSymbol
    | FunctionSymbol;
};

type SymbolTable = Map<string, SymbolValue>;

export class ContextStack {
  private readonly globalContext: SymbolTable = new Map();
  private readonly stack: SymbolTable[] = [];

  getSymbol(name: string): SymbolValue | null {
    const stack = this.stack.find((ctx) => ctx.has(name)) ?? this.globalContext;
    const symbol = stack.get(name);
    return symbol ?? null;
  }

  setSymbol(name: string, value: SymbolValue): void {
    const stack =
      this.stack.find((ctx) => ctx.has(name)) ?? this.globalContext.has(name)
        ? this.globalContext
        : this.stack[this.stack.length - 1];
    stack.set(name, value);
  }

  pushContext(): void {
    this.stack.push(new Map());
  }

  popContext(): void {
    this.stack.pop();
  }
}
