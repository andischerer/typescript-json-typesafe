# typescript-json-typesafe [![Build Status](https://travis-ci.org/andischerer/typescript-json-typesafe.svg?branch=master)](https://travis-ci.org/andischerer/typescript-json-typesafe)
> checks a json object against a specific type/interface

## Install

```
$ npm install --save typescript-json-typesafe
```

## Usage

```js
const tsJson = require('typescript-json-typesafe');
const jsonObject = require('jsonToTest.json');

# returns true if valid, throws if not
tsJson.isTypeSafe(jsonObject, 'ITestInterface');
```

## License

MIT © Andreas Scherer