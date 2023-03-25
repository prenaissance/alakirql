import { Interpreter } from "@/interpreter";
import { describe, beforeEach, expect, it } from "vitest";

describe("interpreter -> functions", () => {
  let interpreter: Interpreter;

  beforeEach(() => {
    interpreter = new Interpreter();
  });

  it("should get the length of an array", () => {
    interpreter.interpret("const arr = [1, 2, 3]; print len(arr);");
    expect(interpreter.io.outputs).toEqual(["3"]);
  });

  it("should find the lucky number based on name", () => {
    interpreter.interpret('print lucky("John"); print lucky("Jane");');
    expect(interpreter.io.outputs).toEqual(["15", "22"]);
  });
});
