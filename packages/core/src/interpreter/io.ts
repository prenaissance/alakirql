export class IO {
  readonly outputs: any[] = [];
  private readonly subscribers = new Set<(output: any) => void>();

  subscribe(subscriber: (output: any) => void) {
    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  print(message: string): void {
    this.outputs.push(message);
    this.subscribers.forEach((subscriber) => subscriber(message));
  }

  // to be used to notify of statements that don't print anything
  advance(message: any): void {
    this.subscribers.forEach((subscriber) => subscriber(message));
  }
}
