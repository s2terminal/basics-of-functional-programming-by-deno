import type { MonadValue, IDMonad } from './monad/iomonad.ts';

// リスト8.2 式の代数的データ構造
export type Name = string;
export type PrimitiveValue = number | undefined;

type ExpressionPattern = {
  [key in keyof ExpressionModule]?: IDMonad<MonadValue>;
};
export type ExpressionData = (pattern: ExpressionPattern) => Expression;
type Match = (data: ExpressionData, pattern: ExpressionPattern) => Expression;

export type Value = (v: PrimitiveValue) => ExpressionData;
type Variable = (name: Name) => ExpressionData;
type Lambda = (variable: ReturnType<Variable>, body: ExpressionData) => ExpressionData;
type Application = (lambda: ReturnType<Lambda>, arg: ExpressionData) => ExpressionData;

type Expression = Value | Variable | Lambda | Application;

type ExpressionModule = {
  match: Match,
  num: Value,
  variable: Variable,
  lambda: Lambda,
  app: Application,
  add: (expL: ReturnType<Expression>, expR: ReturnType<Expression>) => ExpressionData
}

export const exp: ExpressionModule = {
  match: (data, pattern) => {
    return data(pattern);
  },
  num: (value) => {
    return (pattern) => {
      return pattern.num(value);
    };
  },
  variable: (name) => {
    return (pattern) => {
      return pattern.variable(name);
    };
  },
  lambda: (variable, body) => {
    return (pattern: ExpressionPattern) => {
      return pattern.lambda(variable, body);
    };
  },
  app: (lambda, arg) => {
    return (pattern) => {
      return pattern.app(lambda, arg);
    };
  },

  add: (expL, expR) => {
    return (pattern) => {
      return pattern.add(expL, expR);
    }
  }
}

