import { Token, TokenNode, TokenType, TokenValueNode } from "@/lexer/tokens";
import { Parser } from "./parser";
import { between, lazy, oneOf } from "./combinations";

export const token = (token: TokenType) => {
  return new Parser<Token>((state) => {
    if (state.isError) {
      return state;
    }

    const currentToken = state.tokens[state.index];
    if (currentToken.type === token) {
      return {
        ...state,
        index: state.index + 1,
        result: currentToken,
      };
    }

    return {
      ...state,
      isError: true,
      error: `Expected token ${token} but got ${currentToken.type}`,
    };
  });
};

export const number = token(TokenType.Number).map(
  (token) => (token as TokenValueNode<TokenType.Number, number>).value,
);

export const string = token(TokenType.String).map(
  (token) => (token as TokenValueNode<TokenType.String, string>).value,
);

export const date = token(TokenType.Date).map(
  (token) => (token as TokenValueNode<TokenType.Date, Date>).value,
);

export const boolean = token(TokenType.Boolean).map(
  (token) => (token as TokenValueNode<TokenType.Boolean, boolean>).value,
);

export const identifier = token(TokenType.Identifier).map(
  (token) => (token as TokenValueNode<TokenType.Identifier, string>).value,
);

export const betweenBrackets = between(
  token(TokenType.OpenBracket),
  token(TokenType.CloseBracket),
);

export const betweenSquareBrackets = between(
  token(TokenType.OpenSquareBracket),
  token(TokenType.CloseSquareBracket),
);
export const betweenCurlyBrackets = between(
  token(TokenType.OpenCurlyBracket),
  token(TokenType.CloseCurlyBracket),
);

export const binaryOperatorTokens = [
  // priority 1
  TokenType.Plus,
  TokenType.Minus,
  TokenType.Multiply,
  // priority 2
  TokenType.Divide,
  TokenType.Modulo,
  TokenType.Exponent,
  //priority 3
  TokenType.And,
  TokenType.Or,
  TokenType.Not,
  // priority 4
  TokenType.Equal,
  TokenType.NotEqual,
  TokenType.LessThan,
  TokenType.LessThanOrEqual,
  TokenType.GreaterThan,
  TokenType.GreaterThanOrEqual,
  // priority 5 ?
  TokenType.Assignment,
] as const;
export type BinaryOperatorToken = (typeof binaryOperatorTokens)[number];
export type BinaryOperatorTokenNode = TokenNode<BinaryOperatorToken>;

export const additiveOperator = oneOf(
  token(TokenType.Plus),
  token(TokenType.Minus),
) as Parser<BinaryOperatorTokenNode>;

export const multiplicativeOperator = oneOf(
  token(TokenType.Multiply),
  token(TokenType.Divide),
  token(TokenType.Modulo),
) as Parser<BinaryOperatorTokenNode>;

export const comparisonOperator = oneOf(
  token(TokenType.Equal),
  token(TokenType.NotEqual),
  token(TokenType.LessThan),
  token(TokenType.LessThanOrEqual),
  token(TokenType.GreaterThan),
  token(TokenType.GreaterThanOrEqual),
) as Parser<BinaryOperatorTokenNode>;

export const logicalOperator = oneOf(
  token(TokenType.And),
  token(TokenType.Or),
  token(TokenType.Not),
) as Parser<BinaryOperatorTokenNode>;

export const assignmentOperator = token(
  TokenType.Assignment,
) as Parser<BinaryOperatorTokenNode>;
