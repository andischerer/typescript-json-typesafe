# typescript-json-typesafe [![Build Status](https://travis-ci.org/andischerer/typescript-json-typesafe.svg?branch=master)](https://travis-ci.org/andischerer/typescript-json-typesafe)
> checks a JSON object against a specific type/interface

## Install

```
$ npm install --save typescript-json-typesafe
```

## Usage
Get a JSON file from disk or from an http api and check it against an existing typescript interface/type. 
Useful for ci regression testing.  

```js
const tsJson = require('typescript-json-typesafe');
const jsonObject = require('jsonToTest.json');

# returns true if valid, throws if not
tsJson.isTypeSafe(jsonObject, 'ITestInterface');
```

## API

### isTypeSafe(jsonObject: any, variableType: string, [jsonFileName: string]): boolean

Returns true if the passed in jsonObject compiles against the given interface/type. 
If not, this method throws an Exception from the typescript compiler with compileerrors.  

#### jsonObject
Type: `object`, `array`, `string`
Pass in any parsed json.

#### variableType
Type `string`
Could be an interface or type to compile against

#### jsonFileName
Type `string` [optional] 
If there was any compile error. The passed in jsonFileName gets referenced in the error message.


## License

MIT © Andreas Scherer