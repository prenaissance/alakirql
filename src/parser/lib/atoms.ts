import { Token, TokenNode, TokenType, TokenValueNode } from "@/lexer/tokens";
import { Parser } from "./parser";

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
