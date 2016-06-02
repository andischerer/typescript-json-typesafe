import * as fs from 'fs';
import * as ts from 'typescript';
import test from 'ava';

import {isTypeSafe} from '../';

test('primitives', t => {
  t.true(isTypeSafe(1, 'number'));
  t.true(isTypeSafe('hutzlibutz', 'string'));
  t.true(isTypeSafe(true, 'boolean'));
  t.true(isTypeSafe({}, 'Object'));
  t.true(isTypeSafe([], 'Array<string>'));
});

test('simple json object', t => {
  const safeJson: IJsonObjectTest = {
    "foo": "bar"
  };
  t.true(isTypeSafe(safeJson, 'IJsonObjectTest'));

  const unsafeJson = {
    "fooish": "bar"
  };
  t.throws(() => isTypeSafe(unsafeJson, 'IJsonObjectTest'));
});

test('simple json array', t => {
  const safeJson: string[] = [
    "foo",
    "bar"
  ];
  t.true(isTypeSafe(safeJson, 'string[]'));

  const unsafeJson = [
    "foo",
    "bar",
    21,
    {}
  ];
  t.throws(() => isTypeSafe(unsafeJson, 'Array<string>'));
});

test('json nested arrays/objects', t => {
  const safeJson: INestedJsonTypesTest = {
    "foo": "bar",
    "nestedArray": [
      "nesti1",
      { "nestedObject": "nesti2" }
    ]
  };
  t.true(isTypeSafe(safeJson, 'INestedJsonTypesTest'));

  const unsafeJson = {
    "foo": "bar",
    "nestedArray": [
      "nesti1",
      [1,2],
      { "nestedObject": "nesti2" }
    ]
  };
  t.throws(() => isTypeSafe(unsafeJson, 'INestedJsonTypesTest'));
});

test('custom filename on error', t => {
  t.plan(2);

  try {
    isTypeSafe(1, 'string', 'testNumber.json');
  } catch(e) {
    t.truthy(e.message.match(/testNumber\.json/));
  }

  try {
    isTypeSafe(1, 'string');
  } catch(e) {
    t.falsy(e.message.match(/testNumber\.json/));
  }
});
