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