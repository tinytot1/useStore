import React, { useEffect, useMemo, useRef, useContext, useDebugValue, useReducer } from "react"

import { ProviderProps, SimpleProviderProps, State, StoreDispatch, Model, Status } from './interface';
import { createStore } from './store';
import { getContext, createContext, deleteContext } from './context';
import invariant from 'invariant';
import { looseEqual, isPlainObject, isFunction, isString } from './utils';
import { ACTION_STATUS_NAME as ASN, actionStatusModel, DEFAULT_STATUS } from './statusModel';

export function checkModels(models: Model[]) {

  invariant(Array.isArray(models), 'models should be array!');
  invariant(models.length >= 1, 'should provide at last one model!');

  for (const model of models) {
    checkModel(model);
  }
}

function checkModel(model: Model) {
  invariant(isPlainObject(model), 'model should be plain object!');

  const { name, state, actions = {} /* , middlewares */ } = model;

  invariant(name, 'model name is required!');
  invariant(typeof name === 'string', 'model name should be string!');

  invariant(isPlainObject(state), 'model state should be plain object!');

  invariant(isPlainObject(actions), `model actions should be plain object!`);
  for (const [action, handler] of Object.entries(actions)) {
    invariant(isFunction(handler), `model[${name}].actions[${action}] should be function!`);
  }

  // if (middlewares) checkMiddlewares(middlewares);
}

const SimpleProvider = React.memo<SimpleProviderProps>(({ model, children }) => {
  const { name } = model
  let Context = getContext(name);
  const store = useMemo(() => createStore(model), [model]);
  if (!Context) {
    Context = createContext(name, store);
  }

  useEffect(() => {
    // cleanup context
    return () => {
      deleteContext(name);
    };
  }, [name]);

  return <Context.Provider value={store}>{children}</Context.Provider>
})

// Provider HOC
const Provider = React.memo<ProviderProps>(({ models, children }) => {
  checkModels(models);
  models.push(actionStatusModel);
  let providers: React.ReactElement;
  // 消费多个 Context Ref https://zh-hans.reactjs.org/docs/context.html#consuming-multiple-contexts
  models.forEach(model => {
    providers = <SimpleProvider model={model}> {providers || children}</SimpleProvider>
  })
  return providers
})

export const createSharedStateContext = () => {
  return { Provider }
}

export function useStore<T = State>(name: string, selector: ((state: State) => T) = (s: State) => (s as T), isEqual = looseEqual): [T, StoreDispatch] {
  const Context = getContext(name);
  invariant(
    Context,
    `store with name[${name}] has not created, please ensure the component is wrapped in a <Provider>`,
  );

  // Ref https://zh-hans.reactjs.org/docs/hooks-reference.html#usedebugvalue
  useDebugValue(name)

  const store = useContext(Context);
  const prevRef = useRef<T>(selector(store.state));
  const value = prevRef.current;

  // Ref https://zh-hans.reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  const forceUpdate = useReducer(x => !x, false)[1];

  useEffect(() => {
    const checkUpdate = (state: State) => {
      const newValue = selector(state)

      if (isEqual(value, newValue)) {
        return
      }
      prevRef.current = newValue;

      forceUpdate()
    }
    return store.subscribe(checkUpdate)
  }, [store, value, selector, forceUpdate, isEqual]);

  return [value, store.dispatch.bind(store)]
}

export function useStatus(actionWithName: string): [Status] {
  invariant(
    actionWithName && isString(actionWithName),
    'You must pass [name/action] to useStatus()',
  );
  const Context = getContext(ASN);

  // Ref https://zh-hans.reactjs.org/docs/hooks-reference.html#usedebugvalue
  useDebugValue(name)

  const store = useContext(Context);
  // init async action status when call `useStatus`
  const prevState = store.state;
  if (!prevState[actionWithName]) {
    prevState[actionWithName] = DEFAULT_STATUS;
  }
  
  const prevStatusRef = useRef<Status>(store.state[actionWithName]);
  const status: Status = prevStatusRef.current;

  // Ref https://zh-hans.reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  const forceUpdate = useReducer(x => !x, false)[1];

  useEffect(() => {
    const checkStatus = (state: State) => {
      const newStatus = state[actionWithName];

      if (looseEqual(newStatus, status)) {
        return;
      }
      prevStatusRef.current = newStatus;

      forceUpdate();
    }
    return store.subscribe(checkStatus)
  }, [store, status, forceUpdate, actionWithName]);

  return [status]
}