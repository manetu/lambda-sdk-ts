# lambda-sdk-ts

This repository hosts an SDK for developing Lambda functions for the Manetu Platform in the [TypeScript](https://www.typescriptlang.org/) programming language.

## Prerequisites

- [make](https://www.gnu.org/software/make/)
- [tsc](https://www.typescriptlang.org/download)
- [rollup](https://rollupjs.org/introduction/#installation)
- [mjsc](https://github.com/manetu/javascript-lambda-compiler)
- [wasm-to-oci](https://github.com/engineerd/wasm-to-oci)

## Project setup

The Manetu platform serves Lambda functions within a [WebAssembly (WASM)](https://webassembly.org/) environment.  We can leverage the TypeScript language in our Lambda functions using a combination of two tools: [rollup](https://rollupjs.org/introduction/#installation) to bundle TypeScript to an [ECMAScript Module (ESM)](https://tc39.es/ecma262/#sec-modules), followed by [mjsc](https://github.com/manetu/javascript-lambda-compiler) to compile ESM to WASM.

### Create a directory for your project

``` shell
mkdir my-lambda
cd my-lambda
```

### Create the build files

#### package.json

``` json
{
  "name": "hello-ts",
  "type": "module",
  "version": "0.0.1",
  "description": "Hello World as a Manetu Lambda Function",
  "main": "src/main.js",
  "dependencies": {
    "manetu-lambda-sdk": "0.0.1",
    "@rollup/plugin-node-resolve": "^15.0.1"
  }
}
```

#### tsconfig.json

``` json
{
    "compilerOptions": {
        "module": "ES6",
        "target": "es2020",
        "outDir": "./target",
        "moduleResolution": "bundler"
    },
    "include": [
        "src/**/*"
    ]
}
```

#### rollup.config.js

``` javascript
import nodeResolve from "@rollup/plugin-node-resolve";

export default {
    plugins: [
        nodeResolve(), // <-- this allows npm modules to be added to bundle
    ],
};
```

#### Makefile

``` Makefile
OBJECT=target/lambda.wasm
SRCS = $(shell find src -type f)

all: $(OBJECT)

target:
	mkdir target

node_modules: package*.json
	npm install

target/main.js: target Makefile node_modules $(SRCS)
	tsc

target/lambda.js: target/main.js rollup.config.js
	rollup $< -o $@ -f es -c

$(OBJECT): target/lambda.js
	mjsc compile $^ -o $@

clean:
	-rm -rf target node_modules
```

### Create the Lambda source

#### Create the source path

``` shell
mkdir -p src
pushd src
```

#### main.ts

``` typescript
import {register} from 'manetu-lambda-sdk';
import {LambdaRequest, LambdaResponse} from 'manetu-lambda-sdk';

function handler(req: LambdaRequest): LambdaResponse {
    // @ts-ignore
    return {status: 200, body: "Hello, " + req.params.name}
}

register(handler);

console.log("Module initialized");
```

#### Return to the top-level directory

``` shell
popd
```

### Compile the program

``` shell
make
```

You should now have a file 'target/lambda.wasm' ready for deployment.

### Publish the WASM code

We can leverage any [OCI](https://opencontainers.org/) registry to publish our Lambda function using the [wasm-to-oci](https://github.com/engineerd/wasm-to-oci) tool.

``` shell
$ wasm-to-oci push target/lambda.wasm my-registry.example.com/my-lambda:v0.0.1
INFO[0003] Pushed: my-registry.example.com/my-lambda:v0.0.1
INFO[0003] Size: 1242738
INFO[0003] Digest: sha256:cf9040f3bcd0e84232013ada2b3af02fe3799859480046b88cdd03b59987f3c9
```

### Define a specification for your Lambda function

Create a file 'site.yml' with the following contents:

``` yaml
api-version: lambda.manetu.io/v1alpha1
kind: Site
metadata:
  name: hello
spec:
  runtime: wasi.1.alpha2
  image: oci://my-registry.example.com/my-lambda:v0.0.1
  env:
    LOG_LEVEL: trace
  triggers:
    http-queries:
      - route: /greet
        summary: "Returns a greeting to the user"
        description: "This request allows you to test the ability to deploy and invoke a simple lambda function."
        query-parameters:
          - name: "name"
            schema: { type: "string" }
            description: "The caller's name"
        responses:
          200:
            description: "computed greeting"
            content:
              text/plain:
                schema:
                  type: string
```

Be sure to adjust the image OCI URL.
