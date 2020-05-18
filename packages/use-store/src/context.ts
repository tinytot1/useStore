import React, { useContext } from 'react';
import { Store } from './store';

const ContextMap = new Map<string, React.Context<Store>>();
const StoreMap = new Map<string, Store>();

export function getContext(name: string) {
  return ContextMap.get(name) || null;
}

export function createContext(name: string, store: Store): React.Context<Store> {
  const Context = React.createContext(store);
  // Ref https://zh-hans.reactjs.org/docs/context.html#contextdisplayname
  Context.displayName = name;
  ContextMap.set(name, Context);
  StoreMap.set(name, store);
  return Context;
}

export function deleteContext(name: string): void {
  ContextMap.delete(name);
  StoreMap.delete(name);
}

export function getStore(name: string) {
  return StoreMap.get(name);
}
