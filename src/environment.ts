import type { Name, PrimitiveValue } from './expression.ts';

// リスト8.4 環境の抽象データ型
export type Environment = (name: Name) => PrimitiveValue;
type EnvironmentModule = {
  empty: Environment,
  lookup: (name: Name, environment: Environment) => ReturnType<Environment>,
  extend: (name: Name, value: ReturnType<Environment>, environment: Environment) => Environment
};
export const env: EnvironmentModule = {
  empty: (_variableName: Name) => {
    return undefined;
  },
  extend: (identifier, value, environment) => {
    return (queryIdentifier) => {
      if (identifier === queryIdentifier) {
        return value;
      } else {
        return env.lookup(queryIdentifier, environment);
      }
    }
  },
  lookup: (variableName, environment) => {
    return environment(variableName)
  }
}

// リスト8.7 変数バインディングにおける環境のセマンティクス
const newEnv = env.extend("a", 1, env.empty);
console.assert(env.lookup("a", newEnv) === 1);

// リスト8.9 クロージャーにおける環境のセマンティクス
const initEnv = env.empty;
const outerEnv = env.extend("x", 1, initEnv);
const closureEnv = env.extend("y", 2, outerEnv);
// [ERROR]: Object is possibly 'undefined' が出るのでassertionする
console.assert(env.lookup("x", closureEnv)! + env.lookup("y", closureEnv)! === 3);
