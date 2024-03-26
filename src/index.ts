
export interface LambdaRequest {
    metadata: object;
    headers: object;
    path_info: string;
    params: object;
}

export interface LambdaResponse {
    status: number;
    headers?: object;
    body?: string;
}

export type HandlerFunction = (request: LambdaRequest) => LambdaResponse;

export function register(fn: HandlerFunction) {
    lambda.register( (req: object): object => {
        return fn(req as LambdaRequest) as LambdaResponse
    });
}

export function query(expr: string) {
    return lambda.query(expr) as LambdaResponse
}