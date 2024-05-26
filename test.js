import { validable } from './validable.js';

async function test() {
  // Create a validable
  const v1 = validable(10);
  const v2 = validable.of(new Date());
  const v3 = validable(v1);
  const v4 = validable.of(v1);

  // Chain
  const v5 = validable(10);
  const v6 = v5.chain((v) => v + 1);
  console.log('v6:', await v6.match()); // 11

  // HO functions
  const addOne = (value) => value + 1;
  const addN = (n) => (value) => value + n;
  const duplicate = (value) => value * 2;
  const multiplyN = (n) => (value) => value * n;
  const v7 = v5.chain(addOne);
  const v8 = v5.chain(addN(5));
  const v9 = v5.chain(duplicate);
  const v10 = v5.chain(multiplyN(4));

  // Multiple chaining
  // Using chain
  const v11 = v5
    .chain(addOne)
    .chain(addN(5))
    .chain(duplicate)
    .chain(multiplyN(4))
    .chain((v) => v === 128);

  // Using mchain
  const v12 = v5.mchain(addOne, addN(5), duplicate, multiplyN(4), (v) => v === 128);

  // Result names and access to the bag
  const v13 = v5 // 10
    .chain(addOne, 'incremented') // 11
    .chain(duplicate, 'duplicated') // 22
    .chain((_, bag) => bag.incremented + bag.duplicated); // we can access previous results by name
  console.log('v13:', await v13.match()); // 33

  // Using match to get the results or apply transformations
  const v14 = await v5.chain(addOne).match(); // default
  console.log('v14:', v14); // 11

  const v15 = await v5.chain(addOne).match((v) => v === 11); // transformation
  console.log('v15:', v15); // correct!

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

  // Check status of validable
  const v18 = await v5.chain((_) => Promise.reject('error')).isValid();
  console.log('v18:', v18); // false

  const v19 = await v5.chain((_) => Promise.reject('error')).isInvalid();
  console.log('v19:', v19); // false
}

test();
