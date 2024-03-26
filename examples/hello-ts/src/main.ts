import {register} from 'manetu-lambda-sdk';
import {LambdaRequest, LambdaResponse} from 'manetu-lambda-sdk';

function handler(req: LambdaRequest): LambdaResponse {
    // @ts-ignore
    return {status: 200, body: "Hello, " + req.params.name}
}

register(handler);

console.log("Module initialized");
