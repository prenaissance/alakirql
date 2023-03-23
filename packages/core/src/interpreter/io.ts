export class IO {
  readonly outputs: string[] = [];
  private readonly subscribers = new Set<(output: string) => void>();

  subscribe(subscriber: (output: string) => void) {
    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  print(message: string): void {
    this.outputs.push(message);
    this.subscribers.forEach((subscriber) => subscriber(message));
  }
}
