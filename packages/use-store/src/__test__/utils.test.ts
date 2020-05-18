import { hasOwn, isFunction, isObject, isPromise, isPlainObject, looseEqual } from "../utils"

describe("utils", () => {
  it.each([
    [{ a: 1 }, "a", true],
    [{ a: 1 }, "b", false],
  ])(
    "test hasOwn(%o) should return %o)",
    (receivedObj, key, expected) => {
      expect(hasOwn(receivedObj, key)).toEqual(expected);
    }
  );

  it.each([
    [() => null, true],
    [{ a: 1 }, false],
  ])(
    "test isFunction(%o) should return  '%o')",
    (received, expected) => {
      expect(isFunction(received)).toEqual(expected);
    }
  );

  it.each([
    [() => null, false],
    [{}, true],
    [[], true],
    [null, false],
  ])(
    "test isObject(%o) should return  '%o')",
    (received, expected) => {
      expect(isObject(received)).toEqual(expected);
    }
  );

  it.each([
    [() => { }, false],
    [() => new Promise((resolve => resolve(1))), false],
    [(() => new Promise((resolve => resolve(1))))(), true],
    [Promise.resolve(), true],
    // eslint-disable-next-line prefer-promise-reject-errors
    [Promise.reject("error"), true],
    [{ then: () => { }, catch: () => { } }, true]
  ])(
    "test isPromise(%o) should return %o)",
    (received, expected) => {
      expect(isPromise(received)).toEqual(expected);
    }
  );

  it.each([
    [() => { }, false],
    [[], false],
    [null, false],
    [{}, true],
    [Object.create(null), true],
    [document, false]
  ])(
    "test isPlainObject(%s) should return %o)",
    (received, expected) => {
      expect(isPlainObject(received)).toEqual(expected);
    }
  );

  it.each([
    [1, 1, true],
    [+0, -0, true],
    [0, false, false],
    ["", false, false],
    ["0", false, false],
    ["0", 0, true],
    [[1, 2, { a: 1 }], [1, 2, { a: 1 }], true],
    [[2, 1, { a: 1 }], [1, 2, { a: 1 }], false],
    [{ a: 1 }, { a: 1 }, true],
    [{ a: 1 }, { a: 1, b: 1 }, false],
    [1, 2, false],
    [1, {}, false],
    [{ a: 1 }, [], false],
    [new Date("2020-05-18 11:05:00"), new Date("2020-05-18 11:05:00"), true]
  ])(
    "test looseEqual(%o, %o) should return %o)",
    (receivedA, receivedB, expected) => {
      expect(looseEqual(receivedA, receivedB)).toEqual(expected);
    }
  );
});