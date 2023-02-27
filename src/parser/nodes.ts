export enum NodeType {
  Program = "Program",
  Statement = "Statement",
  Expression = "Expression",
  Identifier = "Identifier",
  NumericLiteral = "NumericLiteral",
}

export interface Statement {
  type: NodeType;
}

export interface Program extends Statement {
  type: NodeType.Program;
  body: Statement[];
}

export interface Expression extends Statement {
  type: NodeType.Expression;
  left: Expression;
  right: Expression;
  operator: string;
}
