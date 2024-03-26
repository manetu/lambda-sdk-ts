
type HostHandlerFunction = (request: object) => object;

interface lambdaInterface {
  register(fn: HostHandlerFunction): void;
  query(expr: string): object;
}

declare var lambda: lambdaInterface;
