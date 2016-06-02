import * as ts from 'typescript';

const enum Comparison {
  LessThan = -1,
  EqualTo = 0,
  GreaterThan = 1
}

function compareValues<T>(a: T, b: T): Comparison {
  if (a === b) return Comparison.EqualTo;
  if (a === undefined) return Comparison.LessThan;
  if (b === undefined) return Comparison.GreaterThan;
  return a < b ? Comparison.LessThan : Comparison.GreaterThan;
}

function compareMessageText(text1: string | ts.DiagnosticMessageChain, text2: string | ts.DiagnosticMessageChain): Comparison {
  while (text1 && text2) {
    // We still have both chains.
    const string1 = typeof text1 === "string" ? text1 : text1.messageText;
    const string2 = typeof text2 === "string" ? text2 : text2.messageText;

    const res = compareValues(string1, string2);
    if (res) {
      return res;
    }

    text1 = typeof text1 === "string" ? undefined : text1.next;
    text2 = typeof text2 === "string" ? undefined : text2.next;
  }

  if (!text1 && !text2) {
    // if the chains are done, then these messages are the same.
    return Comparison.EqualTo;
  }

  // We still have one chain remaining.  The shorter chain should come first.
  return text1 ? Comparison.GreaterThan : Comparison.LessThan;
}

function getDiagnosticFileName(diagnostic: ts.Diagnostic): string {
    return diagnostic.file ? diagnostic.file.fileName : undefined;
}

function compareDiagnostics(d1: ts.Diagnostic, d2: ts.Diagnostic): Comparison {
  return compareValues(getDiagnosticFileName(d1), getDiagnosticFileName(d2)) ||
    compareValues(d1.start, d2.start) ||
    compareValues(d1.length, d2.length) ||
    compareValues(d1.code, d2.code) ||
    compareMessageText(d1.messageText, d2.messageText) ||
    Comparison.EqualTo;
}

function deduplicateSortedDiagnostics(diagnostics: ts.Diagnostic[]): ts.Diagnostic[] {
  if (diagnostics.length < 2) {
    return diagnostics;
  }
  const newDiagnostics = [diagnostics[0]];
  let previousDiagnostic = diagnostics[0];
  for (let i = 1; i < diagnostics.length; i++) {
    const currentDiagnostic = diagnostics[i];
    const isDupe = compareDiagnostics(currentDiagnostic, previousDiagnostic) === Comparison.EqualTo;
    if (!isDupe) {
      newDiagnostics.push(currentDiagnostic);
      previousDiagnostic = currentDiagnostic;
    }
  }
  return newDiagnostics;
}

function reportDiagnostic(diagnostic: ts.Diagnostic, errorFileName: string): string {
  let output = "";
  output += `${ errorFileName }: `;
  const category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
  output += `${ category } TS${ diagnostic.code }: ${ ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine) }${ ts.sys.newLine }`;
  return output;
}

function sortAndDeduplicateDiagnostics(diagnostics: ts.Diagnostic[]): ts.Diagnostic[] {
  return deduplicateSortedDiagnostics(diagnostics.sort(compareDiagnostics));
}

export function reportDiagnostics(diagnostics: ts.Diagnostic[], errorFileName: string): string[] {
  diagnostics = sortAndDeduplicateDiagnostics(diagnostics);
  const errors = [];
  for (const diagnostic of diagnostics) {
    errors.push(reportDiagnostic(diagnostic, errorFileName));
  }
  return errors;
}
