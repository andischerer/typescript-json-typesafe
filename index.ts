import * as path from 'path';
import * as ts from 'typescript';
import * as reporter from './reporter';

interface TSFile {
  text: string;
  version: number;
}

interface TSFiles {
  [fileName: string]: TSFile;
}

const scriptFileName = 'typedJson.ts';

// The tsconfig.json is found using the same method as `tsc`, starting in the current directory
// and continuing up the parent directory chain.
function findConfigFile(searchPath: string, configFileName: string = 'tsconfig.json'): string {
  while (true) {
    const fileName = path.join(searchPath, configFileName);
    if (ts.sys.fileExists(fileName)) {
      return fileName;
    }
    const parentPath = path.dirname(searchPath);
    if (parentPath === searchPath) {
      break;
    }
    searchPath = parentPath;
  }
  return undefined;
}

function compile(typedJsonContent: string, jsonFileName: string) {
  const customFiles: string[] = [scriptFileName];

  // load tsconfig.json
  let compilerOptions: ts.CompilerOptions = {};
  const configFilePath = findConfigFile(ts.sys.getCurrentDirectory());
  if (configFilePath) {
    const configFile = ts.readConfigFile(configFilePath, ts.sys.readFile);
    if (configFile.error) {
      throw new Error('error while parsing tsconfig.json');
    }
    compilerOptions = configFile.config;
  }

  // Load initial files (core lib files, any files specified in tsconfig.json)
  const configParseResult = ts.parseJsonConfigFileContent(compilerOptions, ts.sys, path.dirname(configFilePath));
  if (configParseResult.errors.length > 0) {
    throw new Error('error while parsing tsconfig.json');
  }
  const files: TSFiles = {};
  configParseResult.fileNames.forEach(filePath => {
    if (ts.sys.fileExists(filePath)) {
      files[filePath] = {
        text: ts.sys.readFile(filePath),
        version: 0
      }
    }
  });

  // add TypedJsonFile
  files[scriptFileName] = {
    text: typedJsonContent,
    version: 0
  };

  const scriptRegex = /\.tsx?$/i;
  const serviceHost: ts.LanguageServiceHost = {
    // getScriptFileNames: () => Object.keys(files),
    getScriptFileNames: () => Object.keys(files).filter(filePath => scriptRegex.test(filePath)),
    getScriptVersion: (fileName) => files[fileName] && files[fileName].version.toString(),
    getScriptSnapshot: (fileName) => {
      const file = files[fileName];
      if (file) {
        return ts.ScriptSnapshot.fromString(file.text);
      }
      const fileContent = ts.sys.readFile(fileName);
      if (fileContent) {
        return ts.ScriptSnapshot.fromString(fileContent);
      }
      return undefined;
    },
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options)
  };

  const languageService = ts.createLanguageService(serviceHost, ts.createDocumentRegistry());
  let diagnostics: ts.Diagnostic[];

  // get and report any syntactic errors.
  diagnostics = languageService.getSyntacticDiagnostics(scriptFileName)
    .concat(languageService.getSemanticDiagnostics(scriptFileName));

  // report any errors we ran into.
  const errorFileName = (jsonFileName === scriptFileName) ? scriptFileName : jsonFileName;
  return reporter.reportDiagnostics(diagnostics, errorFileName);
}

/**
 * checks a json object against a specific type/interface
 *
 * @param  {any} json object to check
 * @param  {string} interface or type to compile against
 * @param  {string} [optional] define a jsonFileName for error message references
 * @returns boolean
 */
export function isTypeSafe(jsonObject: any, variableType: string, jsonFileName: string = scriptFileName): boolean {
  if (!variableType) {
    throw new Error('variableType is missing');
  }
  const typedJson = `const testVar: ${variableType} = ${JSON.stringify(jsonObject)};`;
  const compileErrors = compile(typedJson, jsonFileName);
  if (compileErrors.length > 0) {
    throw new Error(compileErrors.join());
  }
  return true;
}

export default isTypeSafe;
