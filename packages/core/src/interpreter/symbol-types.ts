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

export type UninitializedSymbol = {
  type: SymbolType.Null;
  value: null;
};

export type ArraySymbol = {
  type: SymbolType.Array;
  value: InnerSymbol[];
};

export type ObjectSymbol = {
  type: SymbolType.Object;
  value: Record<string, InnerSymbol>;
};

export type StringSymbol = {
  type: SymbolType.String;
  value: string;
};

export type NumberSymbol = {
  type: SymbolType.Number;
  value: number;
};

export type BooleanSymbol = {
  type: SymbolType.Boolean;
  value: boolean;
};

export type DateSymbol = {
  type: SymbolType.Date;
  value: Date;
};

export type PredefinedFunction = {
  args: SymbolType[];
  body: (...args: any[]) => InnerSymbol;
};

export type FunctionSymbol = {
  type: SymbolType.Function;
  value: PredefinedFunction;
};

export type InnerSymbol =
  | UninitializedSymbol
  | StringSymbol
  | NumberSymbol
  | BooleanSymbol
  | DateSymbol
  | FunctionSymbol
  | ArraySymbol
  | ObjectSymbol
  | FunctionSymbol;

export type SymbolValue = {
  modifier: SymbolModifier;
  symbol: InnerSymbol;
};
