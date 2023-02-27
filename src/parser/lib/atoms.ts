import { Token, TokenType } from "@/lexer/tokens";
import { Parser } from "./parser";

export const token = (token: TokenType) => {
  return new Parser((state) => {
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
