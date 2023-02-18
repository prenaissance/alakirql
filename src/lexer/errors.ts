export class LexingError extends Error {
  constructor(public readonly word: string, public readonly index: number) {
    const message = `Unexpected token "${word}" at index ${index}`;
    super(message);
  }
}
