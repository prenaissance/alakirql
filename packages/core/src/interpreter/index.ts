import {
  ArrayExpression,
  AssignmentExpression,
  Expression,
  ExpressionStatement,
  Identifier,
  IndexingExpression,
  Literal,
  LiteralType,
  MemberExpression,
  NodeType,
  ObjectExpression,
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
    [NodeType.VariableDeclaration]: this.handleVariableDeclaration,
    [NodeType.AssignmentExpression]: this.handleAssignment,
    [NodeType.PrintStatement]: this.handlePrint,
    [NodeType.Program]: this.handleProgram,
    [NodeType.Identifier]: this.handleIdentifier,
    [NodeType.ExpressionStatement]: this.handleExpressionStatement,
    [NodeType.ArrayExpression]: this.handleArrayExpression,
    [NodeType.ObjectExpression]: this.handleObjectExpression,
    [NodeType.MemberExpression]: this.handleMemberExpression,
    [NodeType.IndexingExpression]: this.handleIndexingExpression,
  };
  interpret(program: string) {
    const ast = parse(program);
    if (ast.isError) {
      throw new Error(ast.error);
    }

    this.handleProgram(ast.result);
  }

  handleProgram(node: Program) {
    node.body.forEach((statement) => {
      const result = this.handleStatement(statement);
      if (statement.type !== NodeType.PrintStatement) {
        this.io.advance(result);
      }
    });
  }

  handleStatement(node: Statement) {
    // @ts-ignore
    return this.tokenHandlerMap[node.type].call(this, node);
  }

  handleExpression(node: Expression): InnerSymbol {
    // @ts-ignore
    return this.tokenHandlerMap[node.type].call(this, node);
  }

  handleExpressionStatement(node: ExpressionStatement) {
    return this.handleExpression(node.expression).value;
  }

  handlePrint(node: PrintStatement): void {
    const value = this.handleExpression(node.expression);
    const formatSymbol: (value: InnerSymbol) => any = (value: InnerSymbol) => {
      switch (value.type) {
        case SymbolType.Object:
          return Object.fromEntries(
            Object.entries(value.value).map(
              ([key, value]) =>
                [key, formatSymbol(value)] as [string, InnerSymbol["value"]],
            ),
          );
        case SymbolType.Array:
          return value.value.map((value) => formatSymbol(value).value);
        default:
          return value.value;
      }
    };

    this.io.print(value.value ? JSON.stringify(formatSymbol(value)) : "null");
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
    if (node.left.type !== NodeType.Identifier) {
      const left = this.handleExpression(node.left);
      const right = this.handleExpression(node.right);
      left.type = right.type;
      left.value = right.value;
      return left;
    }

    const { left, right } = node;
    const value = this.handleExpression(right);
    this.context.setMutableSymbol(left.name, value);
    return value;
  }

  handleIdentifier(node: Identifier) {
    const value = this.context.getSymbol(node.name);
    if (value === undefined || value === null) {
      throw new Error(`Symbol ${node.name} is not declared`);
    }
    return value;
  }

  handleVariableDeclaration(node: VariableDeclaration) {
    const { declarations, kind } = node;
    const modifier =
      kind === TokenType.ImmutableDeclaration
        ? SymbolModifier.Immutable
        : SymbolModifier.Mutable;
    declarations.forEach((declaration) => {
      const { id, init } = declaration;
      const value = init
        ? this.handleExpression(init)
        : ({ type: SymbolType.Null, value: null } as InnerSymbol);
      this.context.declareSymbol(id.name, value, modifier);
    });
  }

  handleArrayExpression(node: ArrayExpression) {
    const { elements } = node;
    const values = elements.map((element) => this.handleExpression(element));
    return { type: SymbolType.Array, value: values };
  }

  handleObjectExpression(node: ObjectExpression): InnerSymbol {
    const { properties } = node;
    return {
      type: SymbolType.Object,
      value: Object.fromEntries(
        properties.map((property) => [
          property.key.name,
          this.handleExpression(property.value),
        ]),
      ),
    };
  }

  handleMemberExpression(node: MemberExpression) {
    const { object, property } = node;
    const objectSymbol = this.handleExpression(object);
    if (objectSymbol.type !== SymbolType.Object) {
      throw new Error("Object expected as left operand");
    }
    const value = objectSymbol.value[property.name];
    if (value === undefined) {
      throw new Error(`Property ${property.name} is not defined`);
    }
    return value.value;
  }

  handleIndexingExpression(node: IndexingExpression) {
    const { object, index } = node;
    const objectSymbol = this.handleExpression(object);
    const indexSymbol = this.handleExpression(index);
    if (objectSymbol.type !== SymbolType.Array) {
      throw new Error("Array expected as left operand");
    }
    if (indexSymbol.type !== SymbolType.Number) {
      throw new Error("Number expected as right operand");
    }
    const value = objectSymbol.value[indexSymbol.value];
    if (value === undefined) {
      throw new Error(`Index ${indexSymbol.value} is out of bounds`);
    }
    return value.value;
  }
}
