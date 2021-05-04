import type { MonadValue, IDMonad } from './monad/iomonad.ts';
import { ID } from './monad/iomonad.ts';

import type { Name, PrimitiveValue, ExpressionData } from './expression.ts';
import { exp } from './expression.ts';

import type { Environment } from './environment.ts';
import { env } from './environment.ts';

// リスト8.10 恒等モナド評価器の定義
type Evaluate = (exp: ExpressionData, env: Environment) => IDMonad<MonadValue>;
export const evaluate: Evaluate = (anExp, environment) => {
  return exp.match(anExp, {
    num: (numericValue: PrimitiveValue) => {
      return ID.unit(numericValue);
    },
    variable: (name: Name) => {
      return ID.unit(env.lookup(name, environment));
    },
    lambda: (variable: ExpressionData, body: ExpressionData) => {
      return exp.match(variable, {
        variable: (name: Name) => {
          return ID.unit((actualArg: ReturnType<Environment>) => {
            return evaluate(body, env.extend(name, actualArg, environment));
          });
        },
      });
    },
    app: (lambda: ExpressionData, arg: ExpressionData) => {
      return ID.flatMap(evaluate(lambda, environment))((closure) => {
        return ID.flatMap(evaluate(arg, environment))((actualArg) => {
          return closure(actualArg);
        });
      });
    },

    add: (expL: ExpressionData, expR: ExpressionData) => {
      return ID.flatMap(evaluate(expL, environment))((valueL) => {
        return ID.flatMap(evaluate(expR, environment))((valueR) => {
          return ID.unit(valueL + valueR);
        });
      });
    }
  });
};

// リスト8.12 数値の評価のテスト
console.assert(evaluate(exp.num(2), env.empty) === ID.unit(2));

// リスト8.14 変数の評価のテスト
const newEnv = env.extend("x", 1, env.empty);
console.assert(evaluate(exp.variable("x"), newEnv) === ID.unit(1));

// リスト8.16 足し算の評価のテスト
const addition = exp.add(exp.num(1), exp.num(2));
console.assert(evaluate(addition, env.empty) === ID.unit(3));
