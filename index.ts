import { ID } from './src/monad/iomonad.ts';
import { exp } from './src/expression.ts';
import { env } from './src/environment.ts';
import { evaluate } from './src/evaluate.ts';

// リスト8.17 関数適用の評価のテスト
// ((n) => { return n + 1; })(2)
const expression1 = exp.app(
  exp.lambda(
    exp.variable("n"),
    exp.add(
      exp.variable("n"),
      exp.num(1),
    )
  ),
  exp.num(2)
);
console.assert(evaluate(expression1, env.empty) === ID.unit(3));

console.log('Success!');
