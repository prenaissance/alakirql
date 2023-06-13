import {
  ArrayExpression,
  AssignmentExpression,
  BinaryExpression,
  BlockStatement,
  CallExpression,
  Expression,
  ExpressionStatement,
  Identifier,
  IfStatement,
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
  WhileStatement,
} from "@/parser/nodes";
import { ContextStack } from "./symbol-table";
import { TokenType } from "@/lexer/tokens";
import { IO } from "./io";
import parse from "../parser";
import { InnerSymbol, SymbolModifier, SymbolType } from "./symbol-types";

export class Interpreter {
  private readonly context = new ContextStack();
  readonly io = new IO();
  private readonly tokenHandlerMap = {
    [NodeType.Literal]: this.handleLiteral,
    [NodeType.VariableDeclaration]: this.handleVariableDeclaration,
    [NodeType.AssignmentExpression]: this.handleAssignment,
    [NodeType.PrintStatement]: this.handlePrint,
    [NodeType.IfStatement]: this.handleIfStatement,
    [NodeType.BlockStatement]: this.handleBlockStatement,
    [NodeType.Program]: this.handleProgram,
    [NodeType.Identifier]: this.handleIdentifier,
    [NodeType.ExpressionStatement]: this.handleExpressionStatement,
    [NodeType.ArrayExpression]: this.handleArrayExpression,
    [NodeType.ObjectExpression]: this.handleObjectExpression,
    [NodeType.MemberExpression]: this.handleMemberExpression,
    [NodeType.IndexingExpression]: this.handleIndexingExpression,
    [NodeType.BinaryExpression]: this.handleBinaryExpression,
    [NodeType.WhileStatement]: this.handleWhileStatement,
    [NodeType.CallExpression]: this.handleCallExpression,
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
          return value.value.map((value) => formatSymbol(value));
        default:
          return value.value;
      }
    };

    this.io.print(
      value.value !== null && value.value !== undefined
        ? JSON.stringify(formatSymbol(value))
        : "null",
    );
  }

  handleIfStatement(node: IfStatement) {
    const { test, consequent, alternate } = node;
    const testResult = this.handleExpression(test);
    if (testResult.value) {
      this.handleStatement(consequent);
    } else if (alternate !== null) {
      this.handleStatement(alternate);
    }
  }

  handleBlockStatement(node: BlockStatement) {
    this.context.pushContext();
    node.body.forEach((statement) => this.handleStatement(statement));
    this.context.popContext();
  }

  handleWhileStatement(node: WhileStatement) {
    const { test, body } = node;
    while (this.handleExpression(test).value) {
      this.handleStatement(body);
    }
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

  handleCallExpression(node: CallExpression) {
    const { callee, arguments: args } = node;
    const func = this.handleExpression(callee);
    if (func.type !== SymbolType.Function) {
      throw new Error("Cannot call non-function");
    }
    const values = args.map((arg) => this.handleExpression(arg));
    if (func.value.args.length !== values.length) {
      throw new Error(
        `Expected ${func.value.args.length} arguments, got ${values.length}`,
      );
    }
    func.value.args.forEach((argType, index) => {
      if (argType !== values[index].type) {
        throw new Error(
          `Argument ${index} of type ${argType} expected, got ${values[index].type}`,
        );
      }
    });

    return func.value.body(...values);
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
    return value;
  }

  handleIndexingExpression(node: IndexingExpression) {
    const { object, index } = node;
    const objectSymbol = this.handleExpression(object);
    const indexSymbol = this.handleExpression(index);
    if (objectSymbol.type === SymbolType.Array) {
      if (indexSymbol.type !== SymbolType.Number) {
        throw new Error("Number expected as right operand");
      }
      const value = objectSymbol.value[indexSymbol.value];
      if (value === undefined) {
        throw new Error(`Index ${indexSymbol.value} is out of bounds`);
      }
      return value;
    }
    if (objectSymbol.type === SymbolType.Object) {
      if (indexSymbol.type !== SymbolType.String) {
        throw new Error("String expected as right operand");
      }
      const value = objectSymbol.value[indexSymbol.value];
      if (value === undefined) {
        throw new Error(`Property ${indexSymbol.value} is not defined`);
      }
      return value;
    }
    throw new Error(
      "Array or Object expected as left operand of indexing expression",
    );
  }

  handleBinaryExpression(node: BinaryExpression) {
    const { left, right, operator } = node;
    const leftSymbol = this.handleExpression(left);
    const rightSymbol = this.handleExpression(right);
    switch (operator) {
      case TokenType.Plus:
        if (
          leftSymbol.type === SymbolType.String &&
          rightSymbol.type === SymbolType.String
        ) {
          return {
            type: SymbolType.String,
            value: leftSymbol.value + rightSymbol.value,
          };
        }
        if (
          leftSymbol.type === SymbolType.Number &&
          rightSymbol.type === SymbolType.Number
        ) {
          return {
            type: SymbolType.Number,
            value: leftSymbol.value + rightSymbol.value,
          };
        }
        if (
          leftSymbol.type === SymbolType.Date &&
          rightSymbol.type === SymbolType.Date
        ) {
          return {
            type: SymbolType.Date,
            value: new Date(
              leftSymbol.value.getTime() + rightSymbol.value.getTime(),
            ),
          };
        }
        throw new Error(
          `Cannot add type ${leftSymbol.type} and type ${rightSymbol.type}`,
        );
      case TokenType.Minus:
        if (
          leftSymbol.type === SymbolType.Number &&
          rightSymbol.type === SymbolType.Number
        ) {
          return {
            type: SymbolType.Number,
            value: leftSymbol.value - rightSymbol.value,
          };
        }
        if (
          leftSymbol.type === SymbolType.Date &&
          rightSymbol.type === SymbolType.Date
        ) {
          return {
            type: SymbolType.Number,
            value: leftSymbol.value.getTime() - rightSymbol.value.getTime(),
          };
        }
        throw new Error(
          `Cannot subtract type ${leftSymbol.type} and type ${rightSymbol.type}`,
        );
      case TokenType.Multiply:
        if (
          leftSymbol.type === SymbolType.Number &&
          rightSymbol.type === SymbolType.Number
        ) {
          return {
            type: SymbolType.Number,
            value: leftSymbol.value * rightSymbol.value,
          };
        }
        throw new Error(
          `Cannot multiply type ${leftSymbol.type} and type ${rightSymbol.type}`,
        );
      case TokenType.Divide:
        if (
          leftSymbol.type === SymbolType.Number &&
          rightSymbol.type === SymbolType.Number
        ) {
          return {
            type: SymbolType.Number,
            value: leftSymbol.value / rightSymbol.value,
          };
        }
        throw new Error(
          `Cannot divide type ${leftSymbol.type} and type ${rightSymbol.type}`,
        );
      case TokenType.Modulo:
        if (
          leftSymbol.type === SymbolType.Number &&
          rightSymbol.type === SymbolType.Number
        ) {
          return {
            type: SymbolType.Number,
            value: leftSymbol.value % rightSymbol.value,
          };
        }
        throw new Error(
          `Cannot modulo type ${leftSymbol.type} and type ${rightSymbol.type}`,
        );
      case TokenType.Equal:
        return {
          type: SymbolType.Boolean,
          value: leftSymbol.value === rightSymbol.value,
        };
      case TokenType.NotEqual:
        return {
          type: SymbolType.Boolean,
          value: leftSymbol.value !== rightSymbol.value,
        };
      case TokenType.GreaterThan:
        if (
          leftSymbol.type === SymbolType.Number &&
          rightSymbol.type === SymbolType.Number
        ) {
          return {
            type: SymbolType.Boolean,
            value: leftSymbol.value > rightSymbol.value,
          };
        }
        if (
          leftSymbol.type === SymbolType.Date &&
          rightSymbol.type === SymbolType.Date
        ) {
          return {
            type: SymbolType.Boolean,
            value: leftSymbol.value > rightSymbol.value,
          };
        }
        throw new Error(
          `Cannot compare type ${leftSymbol.type} and type ${rightSymbol.type}`,
        );
      case TokenType.GreaterThanOrEqual:
        if (
          leftSymbol.type === SymbolType.Number &&
          rightSymbol.type === SymbolType.Number
        ) {
          return {
            type: SymbolType.Boolean,
            value: leftSymbol.value >= rightSymbol.value,
          };
        }
        if (
          leftSymbol.type === SymbolType.Date &&
          rightSymbol.type === SymbolType.Date
        ) {
          return {
            type: SymbolType.Boolean,
            value: leftSymbol.value >= rightSymbol.value,
          };
        }
        throw new Error(
          `Cannot compare type ${leftSymbol.type} and type ${rightSymbol.type}`,
        );
      case TokenType.LessThan:
        if (
          leftSymbol.type === SymbolType.Number &&
          rightSymbol.type === SymbolType.Number
        ) {
          return {
            type: SymbolType.Boolean,
            value: leftSymbol.value < rightSymbol.value,
          };
        }
        if (
          leftSymbol.type === SymbolType.Date &&
          rightSymbol.type === SymbolType.Date
        ) {
          return {
            type: SymbolType.Boolean,
            value: leftSymbol.value < rightSymbol.value,
          };
        }
        throw new Error(
          `Cannot compare type ${leftSymbol.type} and type ${rightSymbol.type}`,
        );
      case TokenType.LessThanOrEqual:
        if (
          leftSymbol.type === SymbolType.Number &&
          rightSymbol.type === SymbolType.Number
        ) {
          return {
            type: SymbolType.Boolean,
            value: leftSymbol.value <= rightSymbol.value,
          };
        }
        if (
          leftSymbol.type === SymbolType.Date &&
          rightSymbol.type === SymbolType.Date
        ) {
          return {
            type: SymbolType.Boolean,
            value: leftSymbol.value <= rightSymbol.value,
          };
        }
        throw new Error(
          `Cannot compare type ${leftSymbol.type} and type ${rightSymbol.type}`,
        );
      case TokenType.And:
        return {
          type: SymbolType.Boolean,
          value: Boolean(leftSymbol.value && rightSymbol.value),
        };
      case TokenType.Or:
        return {
          type: SymbolType.Boolean,
          value: Boolean(leftSymbol.value || rightSymbol.value),
        };
      default:
        throw new Error(`Unknown operator ${operator}`);
    }
  }
}
