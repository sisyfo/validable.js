# Validable.js

Validable.js is essentially a Monad that facilitates you to work with functional programming in javascript.

Main features of Validable.js:

- Function chaining to have declarative code.
- Exception management. You can write code just focused in the logic.
- Mix Sync/Async code seamlessly

## Why do I need this library? :)

The main purpose of this library is to facilitate the error management increasing the expresiveness of the code.

Validable library gives you the following features:

- If the application of a function chain generates an exception, the error propagates trought the function chain untouched.
- A Validable contains the history of all the intermediate functions applied (bag)
- You can customize the error function to generate error logs that are meaninful for your app.
- You can apply transformations to the Validable depending on the status.

## Installation

Use the package manager npm to install Validable.js.

```bash
npm install validablejs
```

## How it works

Validable.js use JS Promises extensively behind the scenes as a wrapper of regular objects, leveraging Promises chain capabilities to provide functional programming features out of the box.

## Create a Validable

There are two ways to define a Validable.js.

```javascript
import { validable } from './validable.js';

const v1 = validable(23);
const v2 = validable.of(23);
```

You can invoke Validable from any type of JS object regardless is native or user defined.

```javascript
import { validable } from './validable.js';

const v1 = validable(10);
const v2 = validable.of('text');
const v3 = validable.of(new Date());
```

You can create a Validable even from another Validable.

```javascript
import { validable } from './validable.js';

const v1 = validable(10);
const v2 = validable(v1);
const v3 = validable.of(v1);
```

## API

### [chain]

The main feature of Validable is the ability to chain functions, increasing the expressiveness of the code.

Usage:

```
output = validable.chain(fx, [name])

fx: function or lambda to be executed.
name (optional): name to store the result.
output: new Validable containing the previous result(s) plus the result of the function execution
```

Examples

```javascript
import { validable } from './validable.js';

// basic usage
const v5 = validable(10);
const v6 = v5.chain((v) => v + 1);

// high order functions
const addOne = (value) => value + 1;
const addN = (n) => (value) => value + n;
const duplicate = (value) => value * 2;
const multiplyN = (n) => (value) => value * n;
const v7 = v5.chain(addOne);
const v8 = v5.chain(addN(5));
const v9 = v5.chain(duplicate);
const v10 = v5.chain(multiplyN(4));

// multiple chaining
const v11 = v5
  .chain(addOne)
  .chain(addN(5))
  .chain(duplicate)
  .chain(multiplyN(4))
  .chain((v) => v === 128);

//using second parameter name
const v12 = v5.chain(addOne, 'incremented');

// Access to the bag
// You can access any of the intermediate values during the function chaining.
const v13 = v5 // 10
  .chain(addOne, 'incremented') // 11
  .chain(duplicate, 'duplicated') // 22
  .chain((_, bag) => bag.incremented + bag.duplicated); // you can access previous results by name
```

### [mchain]

Whenever you need to apply a sequence of functions you can leverage mchain to have even a more succinct declaration.

Note: Functions are being executed in the same order they've been declared.

Usage:

```
output = validable.mchain(fx1, fx2, fx3, ..., fxn)

fx(n): function or lambda to be executed
output: new Validable containing the previous result(s) plus the results of the functions execution
```

Examples

```javascript
import { validable } from './validable.js';

// This is a following example from the chain function
const v13 = validable(10);
const v14 = v13.mchain(addOne, addN(5), duplicate, multiplyN(4), (v) => v === 128);
```

### [match]

This is the function you use to "unwrap" the result from the Validable

As Validable is based on JS Promises to unwrap the inner value you need also to await the result.

Usage:

```
output = validable.match(fx, fe)

fx: function or lambda to be executed over the result if the Validable is successful
fe: the same than fx but in case the Validable was unsuccessful.
output: the output of the fe/fx execution depending on the Validable status

default value for fx and fe is the identity function:
const identityFx = (value) => value

fx and fe are used to apply any transformation needed over the Validable.
If no transformation is needed you can leave it uninformed.
```

### [isValid] / [isInvalid]

You can use this function to check the status of the Validable

Usage:

```
output = validable.isValid()
output = validable.isInvalid()

output: true/false depending if the Validable is valid or invalid.
```

```javascript
// Check status of validable
const v18 = await v5.chain((_) => Promise.reject('error')).isValid();
console.log('v18:', v18); // false

const v19 = await v5.chain((_) => Promise.reject('error')).isInvalid();
console.log('v19:', v19); // false
```

### [orElse]

You can use this function to transform a Validable that is invalid into valid, applying a transformation function.

This function call will be ignored if the Validable is valid.

Usage:

```
output = validable.orElse(fx)

fx: function or lambda to be excuted over the invalid value
output: new Validable with valid status and containing the value of the result to apply the fx function over the current invalid value.
```

```javascript
// Use orElse
const v16 = await v5
  .chain((_) => Promise.reject('error'))
  .chain((v) => v * 10) // This chain call is ignored as the validable is invalid
  .orElse(() => 100)
  .match();
console.log('v16:', v16); // 100

const v17 = await v5
  .chain((v) => v * 5)
  .orElse(() => 1) // This orElse call is ignored as the validable is valid
  .match();
console.log('v17:', v17); // 50
```

## Contributing

Pull requests are welcome.
For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
