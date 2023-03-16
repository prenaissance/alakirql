import {
  ArrayExpression,
  Expression,
  ExpressionStatement,
  Literal,
  NodeType,
  Statement,
  VariableDeclaration,
} from "@/parser/nodes";
import { ContextStack } from "./symbol-table";

export class Interpreter {
  private readonly context = new ContextStack();
  private readonly tokenHandlerMap = {
    [NodeType.Literal]: this.handleLiteral,
    [NodeType.ArrayExpression]: this.handleArrayExpression,
  };

  handleStatement(node: Statement) {
    // @ts-ignore
    return this.tokenHandlerMap[node.type](node);
  }

  handleLiteral(node: Literal) {
    return null;
  }

  handleArrayExpression(node: ArrayExpression) {
    return null;
  }

  handleExpressionStatement(node: ExpressionStatement) {
    return null;
  }
}
