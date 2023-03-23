import {
  ArrayExpression,
  AssignmentExpression,
  Expression,
  ExpressionStatement,
  Identifier,
  Literal,
  LiteralType,
  NodeType,
  PrintStatement,
  Program,
  Statement,
  VariableDeclaration,
} from "@/parser/nodes";
import {
  ContextStack,
  InnerSymbol,
  SymbolModifier,
  SymbolType,
} from "./symbol-table";
import { TokenType } from "@/lexer/tokens";
import { IO } from "./io";
import parse from "../parser";

export class Interpreter {
  private readonly context = new ContextStack();
  readonly io = new IO();
  private readonly tokenHandlerMap = {
    [NodeType.Literal]: this.handleLiteral,
    [NodeType.ArrayExpression]: this.handleArrayExpression,
    [NodeType.VariableDeclaration]: this.handleVariableDeclaration,
    [NodeType.AssignmentExpression]: this.handleAssignment,
    [NodeType.PrintStatement]: this.handlePrint,
    [NodeType.Program]: this.handleProgram,
  };
  interpret(program: string) {
    const ast = parse(program);
    if (ast.isError) {
      throw new Error(ast.error);
    }

    this.handleProgram(ast.result);
  }

  handleProgram(node: Program) {
    node.body.forEach((statement) => this.handleStatement(statement));
  }

  handleStatement(node: Statement) {
    // @ts-ignore
    return this.tokenHandlerMap[node.type](node);
  }

  handleExpression(node: Expression): InnerSymbol {
    // @ts-ignore
    return this.tokenHandlerMap[node.type](node);
  }

  handlePrint(node: PrintStatement): void {
    const value = this.handleExpression(node.expression);
    this.io.print(value.value ? JSON.stringify(value.value) : "null");
  }

  handleLiteral(node: Literal): InnerSymbol {
    switch (node.kind) {
      case LiteralType.Number:
        return { type: SymbolType.Number, value: node.value };
      case LiteralType.String:
        return { type: SymbolType.String, value: node.value };
      case LiteralType.Boolean:
        return { type: SymbolType.Boolean, value: node.value };
      case LiteralType.Date:
        return { type: SymbolType.Date, value: node.value };
      default:
        return { type: SymbolType.Null, value: null };
    }
  }

  handleAssignment(node: AssignmentExpression) {
    const left = this.handleExpression(node.left);
    const right = this.handleExpression(node.right);
    left.type = right.type;
    left.value = right.value;
  }

  handleIdentifier(node: Identifier) {
    const value = this.context.getSymbol(node.name);
    if (value === undefined || value === null) {
      throw new Error(`Symbol ${node.name} is not declared`);
    }
    return value;
  }

  handleVariableDeclaration(node: VariableDeclaration) {
    const { handleExpression, context } = this;
    const { declarations, kind } = node;
    const modifier =
      kind === TokenType.ImmutableDeclaration
        ? SymbolModifier.Immutable
        : SymbolModifier.Mutable;
    declarations.forEach((declaration) => {
      const { id, init } = declaration;
      const value = init
        ? handleExpression(init)
        : ({ type: SymbolType.Null, value: null } as InnerSymbol);
      context.declareSymbol(id.name, value, modifier);
    });
  }

  handleArrayExpression(node: ArrayExpression) {
    return null;
  }

  handleExpressionStatement(node: ExpressionStatement) {
    return null;
  }
}
