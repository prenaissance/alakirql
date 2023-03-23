import lex from "./lexer";
import parse from "./parser";
import { Interpreter } from "./interpreter";

const interpret = (program: string) => {
  const interpreter = new Interpreter();
  const unsubscribe = interpreter.io.subscribe(
    (message) => message && console.log(message),
  );
  interpreter.interpret(program);
  unsubscribe();
};

export { lex, parse, Interpreter, interpret };
