import { Token, TokenNode, TokenType } from "@/lexer/tokens";
import P from "./lib";
import { Parser } from "./lib/parser";
import {
  ArrayExpression,
  AssignmentExpression,
  BinaryExpression,
  BlockStatement,
  BooleanLiteral,
  CallExpression,
  DateLiteral,
  Expression,
  ExpressionStatement,
  Identifier,
  IfStatement,
  IndexingExpression,
  Literal,
  LiteralType,
  MemberExpression,
  NodeType,
  NumericLiteral,
  ObjectExpression,
  PrintStatement,
  Property,
  Statement,
  Stmt,
  StringLiteral,
  VariableDeclaration,
  VariableDeclarator,
} from "./nodes";
import { BinaryOperatorTokenNode, binaryOperatorTokens } from "./lib/atoms";

export const numericLiteralNode: Parser<NumericLiteral> = P.number.map(
  (value) => ({
    type: NodeType.Literal,
    value,
    kind: LiteralType.Number,
  }),
);

export const stringLiteralNode: Parser<StringLiteral> = P.string.map(
  (value) => ({
    type: NodeType.Literal,
    value,
    kind: LiteralType.String,
  }),
);

export const booleanLiteralNode: Parser<BooleanLiteral> = P.boolean.map(
  (value) => ({
    type: NodeType.Literal,
    value,
    kind: LiteralType.Boolean,
  }),
);

export const dateLiteralNode: Parser<DateLiteral> = P.date.map((value) => ({
  type: NodeType.Literal,
  value,
  kind: LiteralType.Date,
}));

export const identifierNode: Parser<Identifier> = P.identifier.map((value) => ({
  type: NodeType.Identifier,
  name: value,
}));

export const literalNode = P.oneOf<Literal>(
  numericLiteralNode,
  stringLiteralNode,
  booleanLiteralNode,
  dateLiteralNode,
);

const noPrecedenceExpressionNode: Parser<Expression> = P.lazy(() =>
  P.oneOf<Expression>(
    callExpressionNode,
    indexingExpressionNode,
    memberExpressionNode,
    literalNode,
    identifierNode,
    arrayExpressionNode,
    objectExpressionNode,
  ),
);

// TODO: Add support for unary expressions
export const expressionNode: Parser<Expression> = P.lazy(() =>
  P.oneOf<Expression>(binaryExpressionNode, noPrecedenceExpressionNode),
);

export const statementNode: Parser<Statement> = P.lazy(() =>
  P.oneOf<Statement>(
    ifStatementNode,
    expressionStatementNode,
    variableDeclarationNode,
    blockStatementNode,
    printStatementNode,
  ),
);

const valueVariableDeclaratorNode = P.sequenceOf<
  Identifier | Token | Expression
>(
  identifierNode,
  P.token(TokenType.Assignment),
  expressionNode,
).map<VariableDeclarator>(([identifier, , value]) => ({
  type: NodeType.VariableDeclarator,
  id: identifier as Identifier,
  init: value as Expression,
}));

const emptyVariableDeclaratorNode = identifierNode.map<VariableDeclarator>(
  (identifier) => ({
    type: NodeType.VariableDeclarator,
    id: identifier,
    init: null,
  }),
);

const declaration = P.oneOf(
  P.token(TokenType.ImmutableDeclaration),
  P.token(TokenType.MutableDeclaration),
);

const variableDeclaratorNode = P.oneOf<VariableDeclarator>(
  valueVariableDeclaratorNode,
  emptyVariableDeclaratorNode,
);

export const variableDeclarationNode = P.sequenceOf<
  Token | VariableDeclarator[]
>(
  declaration,
  P.sepBy1<VariableDeclarator, Token>(
    variableDeclaratorNode,
    P.token(TokenType.Comma),
  ),
  P.token(TokenType.Semicolon),
).map<VariableDeclaration>(([declarationToken, declarators]) => ({
  type: NodeType.VariableDeclaration,
  kind: (
    declarationToken as
      | TokenNode<TokenType.ImmutableDeclaration>
      | TokenNode<TokenType.MutableDeclaration>
  ).type,
  declarations: declarators as VariableDeclarator[],
}));

export const arrayExpressionNode: Parser<ArrayExpression> =
  P.betweenSquareBrackets(
    P.sepBy(expressionNode, P.token(TokenType.Comma)),
  ).map((elements) => ({
    type: NodeType.ArrayExpression,
    elements,
  }));

export const objectExpressionNode: Parser<ObjectExpression> = P.lazy(() =>
  P.betweenCurlyBrackets(
    P.sepBy(
      (
        P.sequenceOf<Identifier | Token | Expression>(
          identifierNode,
          P.token(TokenType.Colon),
          expressionNode,
        ) as Parser<[Identifier, Token, Expression]>
      ).map<Property>(([identifier, , value]) => ({
        type: NodeType.Property,
        key: identifier,
        value,
      })),
      P.token(TokenType.Comma),
    ).map(
      (properties) =>
        ({
          type: NodeType.ObjectExpression,
          properties,
        } as ObjectExpression),
    ),
  ),
);

const memberAccessible = P.lazy(() =>
  P.oneOf<Expression>(
    literalNode,
    identifierNode,
    arrayExpressionNode,
    objectExpressionNode,
  ),
);

export const memberExpressionNode = memberAccessible.chain((object) =>
  P.many1(
    P.sequenceOf<any>(P.token(TokenType.Dot), identifierNode) as Parser<
      [TokenNode<TokenType.Dot>, Identifier]
    >,
  ).map((pairs) =>
    pairs
      .map(([, identifier]) => identifier)
      .reduce(
        (node, property) =>
          ({
            type: NodeType.MemberExpression,
            object: node,
            property,
          } as MemberExpression),
        object,
      ),
  ),
);

const callable = P.lazy(() =>
  P.oneOf<Expression>(
    memberExpressionNode,
    indexingExpressionNode,
    literalNode,
    identifierNode,
    arrayExpressionNode,
    objectExpressionNode,
  ),
);

export const callExpressionNode: Parser<CallExpression> = callable.chain(
  (callee) =>
    P.many(
      P.betweenBrackets(P.sepBy(expressionNode, P.token(TokenType.Comma))),
    ).map<CallExpression>((args) =>
      args.reduce(
        (node, args) => ({
          type: NodeType.CallExpression,
          callee: node,
          arguments: args,
        }),
        callee as unknown as CallExpression,
      ),
    ) as Parser<CallExpression>,
);

const indexable: Parser<Expression> = P.lazy(() =>
  P.oneOf<Expression>(
    memberExpressionNode,
    literalNode,
    identifierNode,
    arrayExpressionNode,
    objectExpressionNode,
  ),
);

export const indexingExpressionNode = indexable.chain((object) => {
  return P.many1(P.betweenSquareBrackets(expressionNode)).map((indexes) => {
    return indexes.reduce(
      (node, index) =>
        ({
          type: NodeType.IndexingExpression,
          object: node,
          index,
        } as IndexingExpression),
      object,
    );
  });
});

const buildTree =
  <T = BinaryExpression>(nodeType: NodeType) =>
  (
    end: Expression,
    rest: Readonly<[Expression, BinaryOperatorTokenNode]>[],
  ): T => {
    if (rest.length === 0) {
      return end as T;
    }
    const [left, { type: operator }] = rest[rest.length - 1];

    return {
      type: nodeType,
      operator,
      left: buildTree(nodeType)(left, rest.slice(0, -1)),
      right: end,
    } as T;
  };

// recursive parser that makes an ast from binary expressions
const binaryExpression =
  (
    operator: Parser<BinaryOperatorTokenNode>,
    nodeType = NodeType.BinaryExpression,
  ) =>
  (parser: Parser<Expression>) =>
    parser.chain((start) =>
      (
        P.many1(
          P.sequenceOf<BinaryOperatorTokenNode | Expression>(operator, parser),
        ) as Parser<[BinaryOperatorTokenNode, Expression][]>
      ).map((rest) => {
        const allOperations = [start, ...rest.flat(1).slice(0, -1)];
        const end = rest[rest.length - 1][1] as Expression;
        const expressions = allOperations.filter(
          (val) => !binaryOperatorTokens.includes(val?.type as any),
        ) as Expression[];
        const operators = allOperations.filter((val) =>
          binaryOperatorTokens.includes(val?.type as any),
        ) as BinaryOperatorTokenNode[];
        const pairs = expressions.map((e, i) => [e, operators[i]] as const);
        return buildTree(nodeType)(end, pairs);
      }),
    );

export const multiplicativeExpressionNode = binaryExpression(
  P.multiplicativeOperator,
)(P.oneOf(P.betweenBrackets(expressionNode), noPrecedenceExpressionNode));

export const additiveExpressionNode: Parser<BinaryExpression> =
  binaryExpression(P.additiveOperator)(
    P.oneOf(
      P.betweenBrackets(expressionNode),
      multiplicativeExpressionNode,
      noPrecedenceExpressionNode,
    ),
  );

export const comparisonExpressionNode = binaryExpression(P.comparisonOperator)(
  P.oneOf(
    P.betweenBrackets(expressionNode),
    additiveExpressionNode,
    multiplicativeExpressionNode,
    noPrecedenceExpressionNode,
  ),
);

export const logicalExpressionNode = binaryExpression(P.logicalOperator)(
  P.oneOf(
    P.betweenBrackets(expressionNode),
    comparisonExpressionNode,
    additiveExpressionNode,
    multiplicativeExpressionNode,
    noPrecedenceExpressionNode,
  ),
);

export const assignmentExpressionNode = noPrecedenceExpressionNode.chain(
  (first) =>
    P.many1(
      P.sequenceOf<BinaryOperatorTokenNode | Expression>(
        P.assignmentOperator,
        P.oneOf(
          P.betweenBrackets(expressionNode),
          logicalExpressionNode,
          comparisonExpressionNode,
          additiveExpressionNode,
          multiplicativeExpressionNode,
          noPrecedenceExpressionNode,
        ),
      ) as Parser<[BinaryOperatorTokenNode, Expression]>,
    ).map((pairs) => {
      const buildAssignmentTree = (
        left: Expression,
        rest: Readonly<[BinaryOperatorTokenNode, Expression]>[],
      ): AssignmentExpression => {
        if (rest.length === 0) {
          return left as AssignmentExpression;
        }
        const [{ type: operator }, right] = rest[0];
        return {
          type: NodeType.AssignmentExpression,
          operator,
          left,
          right: buildAssignmentTree(right, rest.slice(1)),
        } as AssignmentExpression;
      };

      return buildAssignmentTree(first, pairs);
    }),
);

export const binaryExpressionNode = P.oneOf<Expression>(
  assignmentExpressionNode,
  logicalExpressionNode,
  comparisonExpressionNode,
  additiveExpressionNode,
  multiplicativeExpressionNode,
);

export const expressionStatementNode: Parser<ExpressionStatement> =
  P.sequenceOf<Expression | Token>(
    expressionNode,
    P.token(TokenType.Semicolon),
  ).map(
    ([expression]) =>
      ({
        type: NodeType.ExpressionStatement,
        expression,
      } as ExpressionStatement),
  );

export const printStatementNode: Parser<PrintStatement> = P.between(
  P.token(TokenType.Print),
  P.token(TokenType.Semicolon),
)(expressionNode).map((expression) => ({
  type: NodeType.PrintStatement,
  expression,
}));

export const blockStatementNode: Parser<BlockStatement> =
  P.betweenCurlyBrackets(P.many(statementNode)).map((body) => ({
    type: NodeType.BlockStatement,
    body,
  }));

export const ifStatementNode: Parser<IfStatement> = (
  P.sequenceOf<any>(
    P.token(TokenType.If),
    P.betweenBrackets(expressionNode),
    statementNode,
    P.optional(
      P.sequenceOf<Token | Statement>(
        P.token(TokenType.Else),
        statementNode,
      ).map(([, statement]) => statement) as Parser<Statement>,
    ),
  ) as Parser<[never, Expression, Statement, Statement | undefined]>
).map(
  ([, test, consequent, alternate]) =>
    ({
      type: NodeType.IfStatement,
      test,
      consequent,
      alternate: alternate ?? null,
    } as IfStatement),
);
