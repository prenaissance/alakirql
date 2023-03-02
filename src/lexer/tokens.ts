export enum TokenType {
  // keywords
  MutableDeclaration = "MutableDeclaration",
  ImmutableDeclaration = "ImmutableDeclaration",
  DefineFunction = "DefineFunction",
  Return = "Return",
  Print = "Print",
  If = "If",
  Else = "Else",

  // data types
  Identifier = "Identifier",
  String = "String",
  Number = "Number",
  Date = "Date",
  Boolean = "Boolean",

  // Symbols
  LineBreak = "LineBreak",
  Colon = "Colon",
  Semicolon = "Semicolon",
  OpenBracket = "OpenBracket",
  CloseBracket = "CloseBracket",
  OpenCurlyBracket = "OpenCurlyBracket",
  CloseCurlyBracket = "CloseCurlyBracket",
  OpenSquareBracket = "OpenSquareBracket",
  CloseSquareBracket = "CloseSquareBracket",
  Comma = "Comma",
  Dot = "Dot",

  // Operators
  Assignment = "Assignment",
  Plus = "Plus",
  Minus = "Minus",
  Multiply = "Multiply",
  Divide = "Divide",
  Modulo = "Modulo",
  Exponent = "Exponent",
  Equal = "Equal",
  NotEqual = "NotEqual",
  GreaterThan = "GreaterThan",
  GreaterThanOrEqual = "GreaterThanOrEqual",
  LessThan = "LessThan",
  LessThanOrEqual = "LessThanOrEqual",
  And = "And",
  Or = "Or",
  Not = "Not",
}

export interface TokenNode<TokenT extends TokenType> {
  type: TokenT;
  meta: {
    index: number;
  };
}

export interface TokenValueNode<TokenT extends TokenType, ValueT = string>
  extends TokenNode<TokenT> {
  value: ValueT;
}

export type Token =
  // keywords
  | TokenNode<TokenType.MutableDeclaration>
  | TokenNode<TokenType.ImmutableDeclaration>
  | TokenValueNode<TokenType.Identifier>
  | TokenNode<TokenType.DefineFunction>
  | TokenNode<TokenType.Return>
  | TokenNode<TokenType.Print>
  | TokenNode<TokenType.If>
  | TokenNode<TokenType.Else>
  // data types
  | TokenValueNode<TokenType.String>
  | TokenValueNode<TokenType.Number, number>
  | TokenValueNode<TokenType.Date, Date>
  | TokenValueNode<TokenType.Boolean, boolean>
  // Symbols
  | TokenNode<TokenType.LineBreak>
  | TokenNode<TokenType.Colon>
  | TokenNode<TokenType.Semicolon>
  | TokenNode<TokenType.OpenBracket>
  | TokenNode<TokenType.CloseBracket>
  | TokenNode<TokenType.OpenCurlyBracket>
  | TokenNode<TokenType.CloseCurlyBracket>
  | TokenNode<TokenType.OpenSquareBracket>
  | TokenNode<TokenType.CloseSquareBracket>
  | TokenNode<TokenType.Comma>
  | TokenNode<TokenType.Dot>
  // Operators
  | TokenNode<TokenType.Assignment>
  | TokenNode<TokenType.Plus>
  | TokenNode<TokenType.Minus>
  | TokenNode<TokenType.Multiply>
  | TokenNode<TokenType.Divide>
  | TokenNode<TokenType.Modulo>
  | TokenNode<TokenType.Exponent>
  | TokenNode<TokenType.Equal>
  | TokenNode<TokenType.NotEqual>
  | TokenNode<TokenType.GreaterThan>
  | TokenNode<TokenType.GreaterThanOrEqual>
  | TokenNode<TokenType.LessThan>
  | TokenNode<TokenType.LessThanOrEqual>
  | TokenNode<TokenType.And>
  | TokenNode<TokenType.Or>
  | TokenNode<TokenType.Not>;
