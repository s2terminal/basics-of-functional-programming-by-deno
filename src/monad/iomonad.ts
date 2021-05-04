// リスト7.85 恒等モナドの定義
export type IDMonad<T> = T;
type IDMonadModule<T> = {
  unit: (v: T) => IDMonad<T>,
  flatMap: (m: IDMonad<T>) => (f: (v: T) => IDMonad<T>) => IDMonad<T>
};
// TODO: ここはanyで良いのか
export type MonadValue = any;

export const ID: IDMonadModule<MonadValue> = {
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
