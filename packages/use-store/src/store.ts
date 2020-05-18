import { Model, State, Actions } from './interface';
import invariant from 'invariant';
import { isFunction, isPromise } from './utils';
import { ACTION_STATUS_NAME as ASN } from './statusModel';
import { getStore } from './context';

type listener = (state: State) => void

const SubscriptionMap = new Map<string, listener[]>();

export class Store {
  private actions: Actions = {};
  private listeners: listener[];
  constructor(private model: Model) {
    const { name, actions } = this.model;
    this.listeners = SubscriptionMap.get(name);

    if (!this.listeners) {
      this.listeners = SubscriptionMap.set(name, []).get(name);
    }

    // this.actions = createActions(actions);
    this.actions = actions;
  }
  get state(): State {
    return this.model.state;
  }
  get name(): string {
    return this.model.name;
  }

  subscribe(listener: listener) {
    this.listeners.push(listener)
    return () => this.listeners.splice(this.listeners.indexOf(listener), 1)
  }

  async dispatch<T = any>(action: string, value: T) {
    const actionHandler = this.actions[action]
    invariant(isFunction(actionHandler), `model[${this.model.name}].actions[${action}] should be function!`);
    // await actionHandler.apply(this, [value, this.state]);
    let ret = actionHandler.apply(this, [value, this.model.state]);

    if (isPromise(ret)) {
      const actionWithName = `${this.name}/${action}`;
      const storeAsn = getStore(ASN);
      const status = storeAsn.state[actionWithName];
      status && (storeAsn.state[actionWithName] = { pending: true, error: null });
      storeAsn.notify(storeAsn.state);
      try {
        ret = await ret;
        status && (storeAsn.state[actionWithName] = { pending: false, error: null });
        storeAsn.notify(storeAsn.state);
      } catch (e) {
        status && (storeAsn.state[actionWithName] = { pending: false, error: e });
        storeAsn.notify(storeAsn.state);
      }
    }
    // update state
    this.notify();
  }

  notify(state?: State) {
    const listeners = this.listeners.slice();
    for (const literator of listeners) {
      literator(state ?? this.state)
    }
  }
}

export function createStore(model: Model): Store {
  return new Store(model)
}