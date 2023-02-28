export enum NodeType {
  Program = "Program",
  Statement = "Statement",
  Expression = "Expression",
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
}

export interface Statement {
  type: NodeType;
}

export interface Program extends Statement {
  type: NodeType.Program;
  body: Statement[];
}

export type Evaluable =
  | BinaryExpression
  | UnaryExpression
  | Identifier
  | Literal;

interface NumericLiteral extends Statement {
  type: NodeType.Literal;
  value: number;
  kind: LiteralType.Number;
}

interface StringLiteral extends Statement {
  type: NodeType.Literal;
  value: string;
  kind: LiteralType.String;
}

interface BooleanLiteral extends Statement {
  type: NodeType.Literal;
  value: boolean;
  kind: LiteralType.Boolean;
}

interface DateLiteral extends Statement {
  type: NodeType.Literal;
  value: Date;
  kind: LiteralType.Date;
}

export type Literal =
  | NumericLiteral
  | StringLiteral
  | BooleanLiteral
  | DateLiteral;

export interface BinaryExpression extends Statement {
  type: NodeType.BinaryExpression;
  left: Evaluable;
  right: Evaluable;
  operator: string;
}

export interface UnaryExpression extends Statement {
  type: NodeType.UnaryExpression;
  operator: string;
  argument: Evaluable;
}

export interface ExpressionStatement extends Statement {
  type: NodeType.ExpressionStatement;
  expression: Evaluable;
}

export interface Identifier extends Statement {
  type: NodeType.Identifier;
  name: string;
}

export interface VariableDeclarator extends Statement {
  type: NodeType.VariableDeclarator;
  id: Identifier;
  init: Evaluable;
}

export interface VariableDeclaration extends Statement {
  type: NodeType.VariableDeclaration;
  declarations: VariableDeclarator[];
  kind: "mutable" | "immutable";
}
