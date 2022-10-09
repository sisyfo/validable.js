import { validable } from './validable.js';

async function test() {
  const t1 = await validable
    .of(Promise.reject(45))
    .chain((v) => v + 1)
    .orElse(() => 100)
    .match({
      fx: (l, t) => {
        console.log('good:', t);
        return l;
      },
      fe: (l, t) => {
        console.log('bad:', t);
        return l;
      },
    });

  const t2 = await validable(Promise.reject(10))
    .chain((m, r) => {
      return m + 1;
    }, 'name')
    .orElse(() => 50)
    .chain((m) => {
      return m + 1;
    }, 'name2')
    .match({
      fe: (p, r) => {
        console.log(r);
        return p;
      },
    });

  console.log('t1:', t1);
  console.log('t2:', t2);
}

test();
