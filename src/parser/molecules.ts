import { Token, TokenNode, TokenType } from "@/lexer/tokens";
import P from "./lib";
import { Parser } from "./lib/parser";
import {
  ArrayExpression,
  BinaryExpression,
  BooleanLiteral,
  DateLiteral,
  Expression,
  Identifier,
  Literal,
  LiteralType,
  NodeType,
  NumericLiteral,
  StringLiteral,
  VariableDeclaration,
  VariableDeclarator,
} from "./nodes";

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

// TODO: Add support for expressions
export const expressionNode = P.lazy(() =>
  P.oneOf<Expression>(
    literalNode,
    identifierNode,
    arrayExpressionNode,
    binaryExpressionNode,
  ),
);

const noPrecedenceExpressionNode = P.lazy(() =>
  P.oneOf<Expression>(literalNode, identifierNode, arrayExpressionNode),
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

const binaryOperatorTokens = [
  TokenType.Plus,
  TokenType.Minus,
  TokenType.Multiply,
  TokenType.Divide,
  TokenType.Modulo,
  TokenType.Exponent,
] as const;
type BinaryOperatorToken = (typeof binaryOperatorTokens)[number];
type BinaryOperatorTokenNode = TokenNode<BinaryOperatorToken>;

const additiveOperator = P.oneOf(
  P.token(TokenType.Plus),
  P.token(TokenType.Minus),
) as Parser<BinaryOperatorTokenNode>;

const multiplicativeOperator = P.oneOf(
  P.token(TokenType.Multiply),
  P.token(TokenType.Divide),
  P.token(TokenType.Modulo),
) as Parser<BinaryOperatorTokenNode>;

const buildTree = (
  end: Expression,
  rest: Readonly<[Expression, BinaryOperatorTokenNode]>[],
): BinaryExpression => {
  if (rest.length === 0) {
    return end as BinaryExpression;
  }
  const [left, { type: operator }] = rest[rest.length - 1];

  return {
    type: NodeType.BinaryExpression,
    operator,
    left: buildTree(left, rest.slice(0, -1)),
    right: end,
  } as BinaryExpression;
};

// recursive parser that makes an ast from binary expressions
const binaryExpression =
  (operator: Parser<BinaryOperatorTokenNode>) => (parser: Parser<Expression>) =>
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
        return buildTree(end, pairs);
      }),
    );

export const multiplicativeExpressionNode = binaryExpression(
  multiplicativeOperator,
)(P.oneOf(noPrecedenceExpressionNode, P.betweenBrackets(expressionNode)));

export const additiveExpressionNode = binaryExpression(additiveOperator)(
  P.oneOf(
    multiplicativeExpressionNode,
    noPrecedenceExpressionNode,
    P.betweenBrackets(expressionNode),
  ),
);

export const binaryExpressionNode = additiveExpressionNode;
