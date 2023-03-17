import {
  AlreadyDeclaredError,
  ImmutableError,
  NotDeclaredError,
} from "@/interpreter/errors";
import {
  ContextStack,
  SymbolModifier,
  SymbolType,
} from "@/interpreter/symbol-table";
import { beforeEach, describe, expect, it } from "vitest";

const getInitialContextStack = () => {
  const contextStack = new ContextStack();
  contextStack.declareSymbol(
    "a",
    {
      type: SymbolType.Number,
      value: 1,
    },
    SymbolModifier.Mutable,
  );

  contextStack.declareSymbol(
    "COLOR",
    {
      type: SymbolType.String,
      value: "red",
    },
    SymbolModifier.Immutable,
  );

  contextStack.declareSymbol(
    "predefinedFunction",
    {
      type: SymbolType.Function,
      value: () => null,
    },
    SymbolModifier.Predefined,
  );

  contextStack.pushContext();
  contextStack.declareSymbol(
    "a",
    {
      type: SymbolType.Number,
      value: 2,
    },
    SymbolModifier.Mutable,
  );

  return contextStack;
};

describe("interpreter -> symbol table / context stack", () => {
  let contextStack: ContextStack;
  beforeEach(() => {
    contextStack = getInitialContextStack();
  });

  it("should set new symbols", () => {
    contextStack.declareSymbol(
      "c",
      {
        type: SymbolType.Number,
        value: 3,
      },
      SymbolModifier.Mutable,
    );

    expect(contextStack.getSymbol("c")).toEqual({
      type: SymbolType.Number,
      value: 3,
    });
  });

  it("should get symbols from the right context", () => {
    expect(contextStack.getSymbol("a")).toEqual({
      type: SymbolType.Number,
      value: 2,
    });

    contextStack.popContext();

    expect(contextStack.getSymbol("a")).toEqual({
      type: SymbolType.Number,
      value: 1,
    });
  });

  it("should not modify symbols from inferior contexts", () => {
    contextStack.popContext();
    contextStack.pushContext();

    contextStack.setMutableSymbol("a", {
      type: SymbolType.Number,
      value: 3,
    });
  });

  it("should throw when trying to re-declare symbols", () => {
    const action = () =>
      contextStack.declareSymbol(
        "a",
        {
          type: SymbolType.Number,
          value: 3,
        },
        SymbolModifier.Mutable,
      );

    expect(action).toThrowError(AlreadyDeclaredError);
  });

  it("should throw when trying to modify immutable symbols", () => {
    contextStack.popContext();
    const action = () =>
      contextStack.setMutableSymbol("COLOR", {
        type: SymbolType.String,
        value: "blue",
      });

    expect(action).toThrowError(ImmutableError);
  });

  it("should throw when trying to modify predefined symbols", () => {
    contextStack.popContext();
    const action = () =>
      contextStack.setMutableSymbol("predefinedFunction", {
        type: SymbolType.Function,
        value: () => null,
      });

    expect(action).toThrowError(ImmutableError);
  });

  it("should throw when trying to modify undeclared symbols", () => {
    contextStack.popContext();
    const action = () =>
      contextStack.setMutableSymbol("b", {
        type: SymbolType.Number,
        value: 3,
      });

    expect(action).toThrowError(NotDeclaredError);
  });

  it("should throw when trying to get undeclared symbols", () => {
    contextStack.popContext();
    const action = () => contextStack.getSymbol("b");

    expect(action).toThrowError(NotDeclaredError);
  });
});
