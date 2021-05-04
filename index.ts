// TODO: any外したい
type PrimitiveValue = number | undefined | any;
type PrimitiveFunction = (arg: PrimitiveValue) => PrimitiveValue;
type Primitives = PrimitiveValue | PrimitiveFunction;
type Value = PrimitiveValue | ((arg: Primitives) => Primitives);

// リスト7.85 恒等モナドの定義
type IDMonad<T> = T;
type IDMonadModule<T> = {
  unit: (v: T) => IDMonad<T>,
  flatMap: (m: IDMonad<T>) => (f: (v: T) => IDMonad<T>) => IDMonad<T>
};
const ID: IDMonadModule<Value> = {
  unit: value => {
    return value;
  },
  flatMap: instanceM => {
    return transform => {
      return transform(instanceM);
    }
  }
};
// リスト7.86 恒等モナドのunit関数のテスト
console.assert(ID.unit(1) === 1);

// リスト8.2 式の代数的データ構造
type Name = string;
type Expression = Value; // TODO: ここどう表現したら良いのか分からない
type ExpressionModule = {
  match: (data: Expression, pattern: Expression) => Expression,
  num: (v: PrimitiveValue) => Expression,
  variable: (name: Name) => Expression,
  lambda: (name: Expression, body: Expression) => Expression,
  app: (lambda: Expression, arg: Expression) => Expression,
  add: (expL: Expression, expR: Expression) => Expression
}

const exp: ExpressionModule = {
  match: (data: Expression, pattern: Expression) => {
    return data(pattern);
  },
  num: (value: Value) => {
    return (pattern: Expression) => {
      return pattern.num(value);
    };
  },
  variable: (name: Name) => {
    return (pattern: Expression) => {
      return pattern.variable(name);
    };
  },
  lambda: (variable: Expression, body: Expression) => {
    return (pattern: Expression) => {
      return pattern.lambda(variable, body);
    };
  },
  app: (lambda: Expression, arg: Expression) => {
    return (pattern: Expression) => {
      return pattern.app(lambda, arg);
    };
  },

  add: (expL: Expression, expR: Expression) => {
    return (pattern: Expression) => {
      return pattern.add(expL, expR);
    }
  }
}

// リスト8.4 環境の抽象データ型
type Environment = (name: Name) => Value;
type EnvironmentModule = {
  empty: (name: Name) => Value,
  lookup: (name: Name, environment: Environment) => Value,
  extend: (name: Name, value: Value, environment: Environment) => Environment
};
const env: EnvironmentModule = {
  empty: (_variableName: Name) => {
    return undefined;
  },
  extend: (identifier: Name, value: Value, environment: Environment) => {
    return (queryIdentifier) => {
      if (identifier === queryIdentifier) {
        return value;
      } else {
        return env.lookup(queryIdentifier, environment);
      }
    }
  },
  lookup: (variableName: Name, environment: Environment) => {
    return environment(variableName)
  }
}

// リスト8.7 変数バインディングにおける環境のセマンティクス
const newEnv1 = env.extend("a", 1, env.empty);
console.assert(env.lookup("a", newEnv1) === 1);

// リスト8.9 クロージャーにおける環境のセマンティクス
const initEnv = env.empty;
const outerEnv = env.extend("x", 1, initEnv);
const closureEnv = env.extend("y", 2, outerEnv);
// [ERROR]: Object is possibly 'undefined' が出るのでassertionする
console.assert(env.lookup("x", closureEnv)! + env.lookup("y", closureEnv)! === 3);

// リスト8.10 恒等モナド評価器の定義
type Evaluate = (exp: Expression, env: Environment) => IDMonad<Value>;
const evaluate: Evaluate = (anExp: Expression, environment: Environment) => {
  return exp.match(anExp, {
    num: (numericValue: Value) => {
      return ID.unit(numericValue);
    },
    variable: (name: Name) => {
      return ID.unit(env.lookup(name, environment));
    },
    lambda: (variable: Expression, body: Expression) => {
      return exp.match(variable, {
        variable: (name: Name) => {
          return ID.unit((actualArg: Value) => {
            return evaluate(body, env.extend(name, actualArg, environment));
          });
        },
      });
    },
    app: (lambda: Expression, arg: Value) => {
      return ID.flatMap(evaluate(lambda, environment))((closure) => {
        return ID.flatMap(evaluate(arg, environment))((actualArg) => {
          return closure(actualArg);
        });
      });
    },

    add: (expL: Expression, expR: Expression) => {
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
const newEnv2 = env.extend("x", 1, env.empty);
console.assert(evaluate(exp.variable("x"), newEnv2) === ID.unit(1));

// リスト8.16 足し算の評価のテスト
const addition1 = exp.add(exp.num(1), exp.num(2));
console.assert(evaluate(addition1, env.empty) === ID.unit(3));

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
