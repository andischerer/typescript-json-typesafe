interface Promise<T> { }

interface IteratorResult<T> {
    done: boolean;
    value: T;
}

interface Iterator<T> {
    next(value?: any): IteratorResult<T>;
    return?(value?: any): IteratorResult<T>;
    throw?(e?: any): IteratorResult<T>;
}

interface IJsonObjectTest {
  foo: string;
}

interface INestedObject {
  nestedObject: string;
}

interface INestedArray {
  [index: number]: string | INestedObject;
}

interface INestedJsonTypesTest {
  foo: string;
  nestedArray: INestedArray
}
