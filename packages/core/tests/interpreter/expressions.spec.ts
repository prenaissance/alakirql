import { Interpreter } from "@/interpreter/interpreter";
import { describe, beforeEach, expect, it } from "vitest";

describe("interpreter -> expressions", () => {
  let interpreter: Interpreter;

  beforeEach(() => {
    interpreter = new Interpreter();
  });

  it("should handle empty declarations", () => {
    interpreter.interpret("declare a; print a;");
    expect(interpreter.io).toBe(["null"]);
  });

  it("should handle chained declarations", () => {
    interpreter.interpret("declare a, b = 12; print a; print b;");
    expect(interpreter.io).toBe(["null", "12"]);
  });
});
