/**
 * checks a json object against a specific type/interface
 *
 * @param  {any} json object to check
 * @param  {string} interface or type to compile against
 * @param  {string} [optional] define a jsonFileName for error message references
 * @returns boolean
 */
export declare function isTypeSafe(jsonObject: any, variableType: string, jsonFileName?: string): boolean;
export default isTypeSafe;
