import lex from "@/lexer";
import * as M from "./molecules";
import { TokenType } from "@/lexer/tokens";
import { many } from "./lib/combinations";
import { NodeType, Program } from "./nodes";
import { Parser } from "./lib/parser";

const programNode: Parser<Program> = many(M.statementNode).map((body) => ({
  type: NodeType.Program,
  body,
}));

function parse(input: string) {
  // filtered newline as they are not used RN for parsing
  const tokens = lex(input).filter((t) => t.type !== TokenType.LineBreak);
  const result = programNode.run(tokens);
  return result;
}

export default parse;
