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

const operatorPrecedence = {
  [TokenType.Plus]: 1,
  [TokenType.Minus]: 1,
  [TokenType.Multiply]: 2,
  [TokenType.Divide]: 2,
  [TokenType.Modulo]: 2,
  [TokenType.Exponent]: 3,
} as const;
type BinaryOperatorToken = TokenNode<keyof typeof operatorPrecedence>;

const binaryOperatorNode = P.oneOf(
  P.token(TokenType.Plus),
  P.token(TokenType.Minus),
  P.token(TokenType.Multiply),
  P.token(TokenType.Divide),
  P.token(TokenType.Modulo),
  P.token(TokenType.Exponent),
) as Parser<BinaryOperatorToken>;

// recursive parser that makes an ast from binary expressions
const precedence1BinaryExpressionNode = P.sequenceOf<
  Expression | BinaryOperatorToken
>(
  expressionNode,
  P.oneOf(
    P.token(TokenType.Plus),
    P.token(TokenType.Minus),
  ) as Parser<BinaryOperatorToken>,
  expressionNode,
).map<BinaryExpression>((nodes) => {
  const [left, operator, right] = nodes as [
    Expression,
    BinaryOperatorToken,
    Expression,
  ];
  return {
    type: NodeType.BinaryExpression,
    left,
    right,
    operator: operator.type,
  };
});

const precedence2BinaryExpressionNode = P.sequenceOf<
  Expression | BinaryOperatorToken
>(
  expressionNode,
  P.oneOf(
    P.token(TokenType.Multiply),
    P.token(TokenType.Divide),
    P.token(TokenType.Modulo),
  ) as Parser<BinaryOperatorToken>,
  expressionNode,
).map<BinaryExpression>((nodes) => {
  const [left, operator, right] = nodes as [
    Expression,
    BinaryOperatorToken,
    Expression,
  ];
  return {
    type: NodeType.BinaryExpression,
    left,
    right,
    operator: operator.type,
  };
});
