import { TokenType } from "@/lexer/tokens";

export enum NodeType {
  // misc
  Program = "Program",
  Statement = "Statement",
  Property = "Property",
  // expressions
  Expression = "Expression",
  ArrayExpression = "ArrayExpression",
  ObjectExpression = "ObjectExpression",
  BinaryExpression = "BinaryExpression",
  UnaryExpression = "UnaryExpression",
  IndexingExpression = "IndexingExpression",
  MemberExpression = "MemberExpression",
  CallExpression = "CallExpression",
  AssignmentExpression = "AssignmentExpression",
  Identifier = "Identifier",
  Literal = "Literal",
  // statements
  PrintStatement = "PrintStatement",
  ExpressionStatement = "ExpressionStatement",
  VariableDeclarator = "VariableDeclarator",
  VariableDeclaration = "VariableDeclaration",
  IfStatement = "IfStatement",
  WhileStatement = "WhileStatement",
  BlockStatement = "BlockStatement",
}

export enum LiteralType {
  Number = "Number",
  String = "String",
  Boolean = "Boolean",
  Date = "Date",
  Null = "Null",
}

export interface Stmt {
  type: NodeType;
}

export interface Program extends Stmt {
  type: NodeType.Program;
  body: Statement[];
}

export type Expression =
  | ArrayExpression
  | BinaryExpression
  // | UnaryExpression
  | Identifier
  | Literal
  | IndexingExpression
  | MemberExpression
  | CallExpression
  | ObjectExpression
  | AssignmentExpression;

export interface NumericLiteral extends Stmt {
  type: NodeType.Literal;
  value: number;
  kind: LiteralType.Number;
}

export interface StringLiteral extends Stmt {
  type: NodeType.Literal;
  value: string;
  kind: LiteralType.String;
}

export interface BooleanLiteral extends Stmt {
  type: NodeType.Literal;
  value: boolean;
  kind: LiteralType.Boolean;
}

export interface DateLiteral extends Stmt {
  type: NodeType.Literal;
  value: Date;
  kind: LiteralType.Date;
}

// created by the parser only, might be implemented in grammar later
export interface Null extends Stmt {
  type: NodeType.Literal;
  value: null;
  kind: LiteralType.Null;
}

export type Literal =
  | NumericLiteral
  | StringLiteral
  | BooleanLiteral
  | DateLiteral;

export interface ArrayExpression extends Stmt {
  type: NodeType.ArrayExpression;
  elements: Expression[];
}

export interface BinaryExpression extends Stmt {
  type: NodeType.BinaryExpression;
  left: Expression;
  right: Expression;
  operator: string;
}

export interface UnaryExpression extends Stmt {
  type: NodeType.UnaryExpression;
  operator: string;
  argument: Expression;
}

export interface IndexingExpression extends Stmt {
  type: NodeType.IndexingExpression;
  object: Expression;
  index: Expression;
}

export interface MemberExpression extends Stmt {
  type: NodeType.MemberExpression;
  object: Expression;
  property: Identifier;
}

export interface CallExpression extends Stmt {
  type: NodeType.CallExpression;
  callee: Expression;
  arguments: Expression[];
}
export interface Property extends Stmt {
  type: NodeType.Property;
  key: Identifier;
  value: Expression;
}

export interface ObjectExpression extends Stmt {
  type: NodeType.ObjectExpression;
  properties: Property[];
}

export interface AssignmentExpression extends Stmt {
  type: NodeType.AssignmentExpression;
  left: Expression | AssignmentExpression;
  right: Expression;
  operator: TokenType.Assignment;
}

export interface Identifier extends Stmt {
  type: NodeType.Identifier;
  name: string;
}

export type Statement =
  | ExpressionStatement
  | VariableDeclaration
  | PrintStatement
  | IfStatement
  | WhileStatement
  | BlockStatement;

export interface ExpressionStatement extends Stmt {
  type: NodeType.ExpressionStatement;
  expression: Expression;
}

export interface VariableDeclarator extends Stmt {
  type: NodeType.VariableDeclarator;
  id: Identifier;
  init: Expression | null;
}

export interface VariableDeclaration extends Stmt {
  type: NodeType.VariableDeclaration;
  declarations: VariableDeclarator[];
  kind: TokenType.ImmutableDeclaration | TokenType.MutableDeclaration;
}

export interface PrintStatement extends Stmt {
  type: NodeType.PrintStatement;
  expression: Expression;
}

export interface IfStatement extends Stmt {
  type: NodeType.IfStatement;
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}

export interface WhileStatement extends Stmt {
  type: NodeType.WhileStatement;
  test: Expression;
  body: Statement;
}

export interface BlockStatement extends Stmt {
  type: NodeType.BlockStatement;
  body: Statement[];
}
