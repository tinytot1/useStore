import React from "react"

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type ActionHandler = <T = any>(value: T, state: State) => void | Promise<void>;
export interface Actions {
  [key: string]: ActionHandler;
}

export type State = Record<string, any>;

export interface Model {
  name: string;
  state: State;
  actions?: Actions;
}

export interface ProviderProps {
  models: Model[];
  children?: React.ReactNode;
}

export interface SimpleProviderProps {
  model: Model;
  children?: React.ReactNode;
}

export type StoreDispatch = <T = any>(actionKey: string, value: T) => void;

export interface Status {
  pending: boolean;
  error: Error;
}