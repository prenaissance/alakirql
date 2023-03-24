import { Interpreter } from "@/interpreter";
import { describe, beforeEach, expect, it } from "vitest";

describe("interpreter -> expressions", () => {
  let interpreter: Interpreter;

  beforeEach(() => {
    interpreter = new Interpreter();
  });

  it("should handle empty declarations", () => {
    interpreter.interpret("declare a; print a;");
    expect(interpreter.io.outputs).toEqual(["null"]);
  });

  it("should handle chained declarations", () => {
    interpreter.interpret("declare a, b = 12; print a; print b;");
    expect(interpreter.io.outputs).toEqual(["null", "12"]);
  });

  it("should throw on redeclaration", () => {
    expect(() => {
      interpreter.interpret("declare a; declare a;");
    }).toThrow();
  });

  it("should handle assignments", () => {
    interpreter.interpret("declare a = 13; a = 12; print a;");
    expect(interpreter.io.outputs).toEqual(["12"]);
  });

  it("should throw on immutable assignment", () => {
    expect(() => {
      interpreter.interpret("const a = 12; a = 13;");
    }).toThrow();
  });

  it("should handle chained assignments", () => {
    interpreter.interpret("declare a, b; a = b = 13; print a; print b;");
    expect(interpreter.io.outputs).toEqual(["13", "13"]);
  });

  it("should declare object literals", () => {
    interpreter.interpret("declare a = { b: 12 }; print a;");
    expect(interpreter.io.outputs).toEqual(['{"b":12}']);
  });

  it("should handle object property access", () => {
    interpreter.interpret("declare a = { b: 12 }; print a.b;");
    expect(interpreter.io.outputs).toEqual(["12"]);
  });

  it("should handle reassignment of object properties", () => {
    interpreter.interpret("declare a = { b: 12 }; a.b = 13; print a.b;");
    expect(interpreter.io.outputs).toEqual(["13"]);
  });

  it("should declare array literals", () => {
    interpreter.interpret("declare a = [1, 2, 3]; print a;");
    expect(interpreter.io.outputs).toEqual(["[1,2,3]"]);
  });

  it("should handle array indexing", () => {
    interpreter.interpret("declare a = [1, 2, 3]; print a[1];");
    expect(interpreter.io.outputs).toEqual(["2"]);
  });

  describe("binary expressions", () => {
    it("should handle addition", () => {
      interpreter.interpret("print 12 + 13;");
      expect(interpreter.io.outputs).toEqual(["25"]);
    });

    it("should handle subtraction", () => {
      interpreter.interpret("print 12 - 13;");
      expect(interpreter.io.outputs).toEqual(["-1"]);
    });

    it("should handle multiplication", () => {
      interpreter.interpret("print 12 * 13;");
      expect(interpreter.io.outputs).toEqual(["156"]);
    });

    it("should handle division", () => {
      interpreter.interpret("print 12 / 13;");
      expect(interpreter.io.outputs).toEqual(["0.9230769230769231"]);
    });

    it("should handle modulo", () => {
      interpreter.interpret("print 12 % 13;");
      expect(interpreter.io.outputs).toEqual(["12"]);
    });

    it("should handle logical and", () => {
      interpreter.interpret("print true && true;");
      expect(interpreter.io.outputs).toEqual(["true"]);
    });

    it("should handle logical or", () => {
      interpreter.interpret("const a = true; print a || false;");
      expect(interpreter.io.outputs).toEqual(["true"]);
    });

    it("should handle logical equality and inequality", () => {
      interpreter.interpret("print 12 == 13; print 12 != 13;");
      expect(interpreter.io.outputs).toEqual(["false", "true"]);
    });

    it("should prioritize operators in the correct order", () => {
      interpreter.interpret("print 12 + 13 * 2;");
      expect(interpreter.io.outputs).toEqual(["38"]);
    });

    it("should prioritize logical operators in the correct order", () => {
      interpreter.interpret("print 12 + 13 * 2 == 38 && 12 + 13 * 2 != 39;");
      expect(interpreter.io.outputs).toEqual(["true"]);
    });
  });
});
