# useStore

![npm (scoped)](https://img.shields.io/npm/v/@tinytot/use-store)
[![Build Status](https://travis-ci.org/tinytot1/use-store.svg?branch=master)](https://travis-ci.org/tinytot1/use-store)
[![Coverage Status](https://coveralls.io/repos/github/tinytot1/use-store/badge.svg?branch=master)](https://coveralls.io/github/tinytot1/use-store?branch=master)
[![NPM downloads](https://img.shields.io/npm/dw/@tinytot/use-store)](https://npmjs.org/package/@tinytot/use-store)
![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/@tinytot/use-store/0.1.0)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/use-store/peer/react?logo=react)

基于 React Hooks 的轻量级中心化数据管理方案。

## 安装

```bash
$ npm install @tinytot/use-store -S
# or
$ yarn add @tinytot/use-store
```

## 使用

### 1. 中心化的 models 定义

```javascript
// src/models/count.js
export default {
  name: "count",
  state: {
    count: 0,
  },
  actions: {
    add(value, state) {
      state.count = value;
    },
    async fetchData(value, state) {
      state.count = await Promise.resolve(value);
    },
  },
};
```

### 2. models 绑定

```javascript
import { createSharedStateContext } from "@tinytot/use-store";

import countModel from "./models/count";

import Counter from "./src/components/Counter";
import List from "./src/components/List";

const Context = createSharedStateContext();

ReactDOM.render(
  <Context.Provider models={[countModel]}>
    <Counter />
    <List />
  </Context.Provider>,
  document.getElementById("root")
);
```

### 3. 在组件中访问 state 和 actions

```javascript
// src/components/Counter.js
import { useStore, useStatus } from "@tinytot/use-store";

export default () => {
  const [count, dispatch] = useStore("count", (s) => s.count);
  const [status] = useStatus("count.fetchData");
  const handleClick = () => {
    dispatch("add", 1);
  };
  const handleFetchDataClick = () => {
    dispatch("fetchData", 1);
  };
  return (
    <div>
      {Math.random()}
      <div>
        <div>Count: {count}</div>
        <div>{status.pending ? "pending" : ""}</div>
        <button onClick={handleClick}>add 1</button>
        <button onClick={handleDetchDataClick}>async add 1</button>
      </div>
    </div>
  );
};

// src/components/List.js
import { useStore } from "@tinytot/use-store";

export default () => {
  const [count] = useStore("count", (s) => s.count);
  return (
    <div>
      {Math.random()}
      <div>
        <div>Count: {count}</div>
      </div>
    </div>
  );
};
```

## API

### createSharedStateContext

`createSharedStateContext` 是创建 `Context`

```javascript
import { createSharedStateContext } from "@tinytot/use-store";
const Context = createSharedStateContext();

const Root = () => <Provider models={[model1, model2]}>...</Provider>;

ReactDOM.render(<Root />, document.getElementById("root"));
```

### useStore<T = State>(name: string, selector: ((state: State) => T) = (s: State) => (s as T), isEqual = looseEqual): [T, StoreDispatch]

自定义 hook，以元组的形式返回`store`中最新的`state`和可触发`actions`的`dispatch`方法集合。

- name: `model`名称
- selector：用于从`store`里提取所需数据的一个纯函数（不传则返回整个`state`对象），**强烈推荐传入`selector`按需提取数据**，这样可以保证只有被提取的`state`值改变时组件才会`re-render`
- isEqual：前后两次提取的`state`值对比函数，只有值改变才会`re-render`组件

> 直接修改返回的`state`是不安全的（修改不会被同步更新到组件），只有`action`函数和中间对`state`的修改是安全的！<br />

### useStatus(name.action) => { pending: boolean, error: Error }

`useStatus` hook，用于监听（异步）`action`的执行状态，返回`pending`和`error`两个状态，当`action`正在执行时`pending=true`，当执行出错时`error`为具体错误对象，当执行状态发生变化时会同步更新到`DOM`。

## model 定义

`model`是普通的`javascript`对象，类型申明：

```typescript
interface Model {
  readonly name: string; // name of model
  state?: {}; // model state
  readonly actions: {
    [action: string]: <T = any>(value: T, state: State) => void | Promise<void>;
  };
}
```
