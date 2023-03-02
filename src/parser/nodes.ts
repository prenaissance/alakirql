import { TokenType } from "@/lexer/tokens";

export enum NodeType {
  Program = "Program",
  Statement = "Statement",
  Expression = "Expression",
  ArrayExpression = "ArrayExpression",
  BinaryExpression = "BinaryExpression",
  UnaryExpression = "UnaryExpression",
  ExpressionStatement = "ExpressionStatement",
  Identifier = "Identifier",
  Literal = "Literal",
  VariableDeclarator = "VariableDeclarator",
  VariableDeclaration = "VariableDeclaration",
}

export enum LiteralType {
  Number = "Number",
  String = "String",
  Boolean = "Boolean",
  Date = "Date",
  Null = "Null",
}

export interface Statement {
  type: NodeType;
}

export interface Program extends Statement {
  type: NodeType.Program;
  body: Statement[];
}

export type Expression =
  | ArrayExpression
  | BinaryExpression
  | UnaryExpression
  | Identifier
  | Literal;

export interface NumericLiteral extends Statement {
  type: NodeType.Literal;
  value: number;
  kind: LiteralType.Number;
}

export interface StringLiteral extends Statement {
  type: NodeType.Literal;
  value: string;
  kind: LiteralType.String;
}

export interface BooleanLiteral extends Statement {
  type: NodeType.Literal;
  value: boolean;
  kind: LiteralType.Boolean;
}

export interface DateLiteral extends Statement {
  type: NodeType.Literal;
  value: Date;
  kind: LiteralType.Date;
}

// created by the parser only, might be implemented in grammar later
export interface Null extends Statement {
  type: NodeType.Literal;
  value: null;
  kind: LiteralType.Null;
}

export type Literal =
  | NumericLiteral
  | StringLiteral
  | BooleanLiteral
  | DateLiteral
  | null;

export interface ArrayExpression extends Statement {
  type: NodeType.ArrayExpression;
  elements: Expression[];
}

export interface BinaryExpression extends Statement {
  type: NodeType.BinaryExpression;
  left: Expression;
  right: Expression;
  operator: string;
}

export interface UnaryExpression extends Statement {
  type: NodeType.UnaryExpression;
  operator: string;
  argument: Expression;
}

export interface ExpressionStatement extends Statement {
  type: NodeType.ExpressionStatement;
  expression: Expression;
}

export interface Identifier extends Statement {
  type: NodeType.Identifier;
  name: string;
}

export interface VariableDeclarator extends Statement {
  type: NodeType.VariableDeclarator;
  id: Identifier;
  init: Expression;
}

export interface VariableDeclaration extends Statement {
  type: NodeType.VariableDeclaration;
  declarations: VariableDeclarator[];
  kind: TokenType.ImmutableDeclaration | TokenType.MutableDeclaration;
}
