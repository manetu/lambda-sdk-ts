import { register, LambdaRequest, LambdaResponse, query } from 'manetu-lambda-sdk';
import mustache from 'mustache';


const queryTemplate = `
PREFIX id: <http://example.gov/rmv/>
SELECT ?dob
WHERE {
     ?s id:biometric-hash "{{biometric-hash}}" ;
        id:dob            ?dob .
}`;

function mainHandler(req: LambdaRequest): LambdaResponse {

    const pathInfo = req['path-info'];

    console.log(`Determined path_info: ${pathInfo}`);

    switch (pathInfo) {
        case '/over21':
            return ageVerificationHandler(req);
        case '/greet':
            return helloHandler(req);
        default:
            return { status: 404, body: 'Not Found' };
    }
}

function helloHandler(req: LambdaRequest): LambdaResponse {
    // @ts-ignore
    return { status: 200, body: "Hello, " + req.params.name }
}

function ageVerificationHandler(req: LambdaRequest): LambdaResponse {
    try {
        const biometricHash = req.params['biometric-hash'];
        if (!biometricHash) {
            return { status: 400, body: 'Biometric hash is required' };
        }

        const renderedQuery = mustache.render(queryTemplate, { 'biometric-hash': biometricHash });
        const queryResult = query(renderedQuery);

        const resultData = JSON.parse(queryResult.body);

        if (!resultData || !resultData.results || resultData.results.bindings.length === 0) {
            return { status: 200, body: 'not-found' };
        } else if (resultData.results.bindings.length > 1) {
            return { status: 500, body: 'unexpected multiple matching results' };
        }

        const dobBinding = resultData.results.bindings[0]['dob'];
        const dob = new Date(dobBinding.value);
        const isOfAge = VerifyAge(dob, 21);

        return {
            status: 200,
            body: isOfAge ? 'true' : 'false'
        };
    } catch (ex) {
        console.error(ex);
        return { status: 500, body: `query error: ${ex.message}` };
    }
}

function VerifyAge(dob: Date, age: number): boolean {
    const today = new Date();
    const cutoffDate = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
    return dob <= cutoffDate;
}

register(mainHandler);
console.log("Module initialized");
