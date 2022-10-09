const REJECT = 'reject';
const RESOLVE = 'resolve';
const VALIDABLE = 'VALIDABLE';
const errorPropertyName = 'error';
const initPropertyName = 'v0';
const propertyPattern = 'v';

const identityFx = (v) => v;
const noop = () => {};
const getArrayLastItem = (array) => array.slice(-1).pop();
const existsArrayItem = (array, item) => array.some((result) => result.name === item);
let failFx = identityFx;

const getLastResultsValue = (results) => getArrayLastItem(results).value;
const getBag = (results) =>
  results.reduce((acc, current) => ({ ...acc, [current.name]: current.value }), {});

const apply = async (fx, name, results) => {
  const lastResult = getArrayLastItem(results);
  const fxResultName = name ? name : propertyPattern + results.length;

  try {
    if (existsArrayItem(results, fxResultName))
      throw "Variable '" + fxResultName + "' already exists";

    const fxResultValue = await fx(lastResult.value, getBag(results));

    return Promise.resolve([
      ...results,
      { name: fxResultName, value: fxResultValue, type: RESOLVE },
    ]);
  } catch (err) {
    return Promise.reject([
      ...results,
      {
        name: fxResultName,
        value: failFx(err, lastResult, results),
        type: REJECT,
      },
    ]);
  }
};

const validableFn = {
  chain: function (fx, name) {
    const obj = this.fromValidable();
    obj.promise = obj.promise.catch(() => this.promise).then((results) => apply(fx, name, results));
    return obj;
  },
  mchain: function (...fx) {
    return fx.reduce((p, c) => p.chain(c), this);
  },
  orElse: function (fx, name) {
    const obj = this.fromValidable();
    obj.promise = obj.promise.catch((results) => apply(fx, name, results));
    return obj;
  },
  swap: function () {
    //TO-DO
  },
  toString: function () {
    return this.promise
      .then((results) => 'Success - ' + getLastResultsValue(results))
      .catch((results) => 'Fail - ' + getLastResultsValue(results));
  },
  isValid: function () {
    return this.promise.then((_) => true).catch((_) => false);
  },
  isInvalid: async function () {
    return this.promise.then((_) => false).catch((_) => true);
  },
  forEach: function (fx) {
    this.promise.then((results) => fx(getLastResultsValue(results), getBag(results)));
  },
  do: function (fx) {
    this.forEach(fx);
    return this;
  },
  match: async function (fx = identityFx, fe = identityFx) {
    return this.promise
      .then((results) => fx(getLastResultsValue(results), getBag(results)))
      .catch((results) => fe(getLastResultsValue(results), getBag(results)));
  },
  fromValidable: function () {
    return validable(this);
  },
};

const validable = (value) => {
  const obj = Object.create(validableFn);

  if (value && value.type === VALIDABLE) {
    obj.promise = value.promise.then((results) => [...results]);
  } else if (value instanceof Promise) {
    obj.promise = value
      .catch((v) => Promise.reject([{ name: initPropertyName, value: v, type: REJECT }]))
      .then((v) => Promise.resolve([{ name: initPropertyName, value: v, type: RESOLVE }]));
  } else {
    obj.promise = Promise.resolve([{ name: initPropertyName, value: value, type: RESOLVE }]);
  }
  obj.type = VALIDABLE;
  return obj;
};

validable.of = (value) => validable(value);
validable.setFailFn = (params) =>
  (failFx = (err) =>
    Object.keys(params).reduce(
      (acc, current) => ({ ...acc, [current]: params[current](err) }),
      {},
    ));

export { validable };
