import React, { useState, useContext } from "react";
import { mount } from "enzyme";
import { createSharedStateContext, useStore, useStatus } from "../provider";
import { act } from "react-dom/test-utils";
import { State } from '../interface';
import { getContext } from '../context';

describe("basic usage", () => {

  it('use-store should work', async () => {
    const models = [{
      name: 'modelA',
      state: { a: 0, b: 0 }
    }];

    const App = () => {
      const [{ a }] = useStore('modelA');
      return <button>a:{a}</button>;
    };
    const Context = createSharedStateContext()
    const Test = () => <Context.Provider models={models}><App /></Context.Provider>;
    const wrapper = mount(<Test />);
    expect(wrapper).toMatchSnapshot()
  })

  it('use-store should work when state changed', async () => {
    const models = [{
      name: 'modelA',
      state: { a: 0, b: 0 },
      actions: {
        addA(value: any, state: State) {
          state.a = value;
        }
      },
    }];

    const App = () => {
      const [a, dispatch] = useStore('modelA', s => s.a);
      const handleClick = (e: any) => {
        dispatch("addA", e.target.value)
      }
      return <button onClick={handleClick}>a:{a}</button>;
    };
    const AppB = () => {
      const [a] = useStore('modelA', s => s.a);
      return <div >a:{a}</div>;
    };
    const Context = createSharedStateContext()
    const Test = () => <Context.Provider models={models}><App /><AppB /></Context.Provider>;
    const wrapper = mount(<Test />);
    const buttonNode = wrapper.find("button").at(0);
    const appBNode = wrapper.find("AppB").find("div").at(0);
    expect(buttonNode.text()).toEqual('a:0');
    expect(appBNode.text()).toEqual('a:0');
    await act(async () => {
      buttonNode.simulate("click", { target: { value: 1 } })
      await (global as any).flushPromise(30);
    });
    wrapper.update();
    jest.runAllImmediates()
    expect(buttonNode.text()).toEqual('a:1');
    expect(appBNode.text()).toEqual('a:1');

    await act(async () => {
      buttonNode.simulate("click", { target: { value: 1 } })
      await (global as any).flushPromise(30);
    });
    wrapper.update();
    jest.runAllImmediates()
    expect(buttonNode.text()).toEqual('a:1');
    expect(appBNode.text()).toEqual('a:1');
  })

  it('use-store should work when state changed with promise action', async () => {
    const models = [{
      name: 'modelA',
      state: { a: 0, b: 0 },
      actions: {
        async addA(value: any, state: State) {
          state.a = await Promise.resolve(value);
        }
      },
    }];

    const App = () => {
      const [a, dispatch] = useStore('modelA', s => s.a);
      const handleClick = (e: any) => {
        dispatch("addA", e.target.value)
      }
      return <button onClick={handleClick}>a:{a}</button>;
    };
    const AppB = () => {
      const [a] = useStore('modelA', s => s.a);
      return <div >a:{a}</div>;
    };
    const Context = createSharedStateContext()
    const Test = () => <Context.Provider models={models}><App /><AppB /></Context.Provider>;
    const wrapper = mount(<Test />);
    const buttonNode = wrapper.find("button").at(0);
    const appBNode = wrapper.find("AppB").find("div").at(0);
    expect(buttonNode.text()).toEqual('a:0');
    expect(appBNode.text()).toEqual('a:0');
    await act(async () => {
      buttonNode.simulate("click", { target: { value: 1 } })
      await (global as any).flushPromise(30);
    });
    wrapper.update();
    jest.runAllImmediates()
    expect(buttonNode.text()).toEqual('a:1');
    expect(appBNode.text()).toEqual('a:1');

    await act(async () => {
      buttonNode.simulate("click", { target: { value: 1 } })
      await (global as any).flushPromise(30);
    });
    wrapper.update();
    jest.runAllImmediates()
    expect(buttonNode.text()).toEqual('a:1');
    expect(appBNode.text()).toEqual('a:1');
  })

  it('use-store should work when state changed with promise action usage useStatus', async () => {
    const models = [{
      name: 'modelA',
      state: { a: 0, b: 0 },
      actions: {
        async addA(value: any, state: State) {
          state.a = await Promise.resolve(value);
        },
        async reduceA(value: any, state: State) {
          state.a = await Promise.reject(new Error("err"));
        }
      },
    }];

    const App = () => {
      const [a, dispatch] = useStore('modelA', s => s.a);
      const [status] = useStatus("modelA/reduceA");
      const [statusA] = useStatus("modelA/addA");
      const handleClick = (e: any) => {
        dispatch("addA", e.target.value)
      }
      const handleReduceClick = (e: any) => {
        dispatch("reduceA", e.target.value)
      }
      return <div>
        <button onClick={handleClick}>a:{a}</button>
        <button onClick={handleReduceClick}>a:{status?.error?.toString()}</button>
      </div>;
    };
    const AppB = () => {
      const [a] = useStore('modelA', s => s.a);
      return <div >a:{a}</div>;
    };
    const Context = createSharedStateContext()
    const Test = () => <Context.Provider models={models}><App /><AppB /></Context.Provider>;
    const wrapper = mount(<Test />);
    const buttonNode = wrapper.find("button").at(0);
    const buttonReduceNode = wrapper.find("button").at(1);
    const appBNode = wrapper.find("AppB").find("div").at(0);
    expect(buttonNode.text()).toEqual('a:0');
    expect(appBNode.text()).toEqual('a:0');
    await act(async () => {
      buttonNode.simulate("click", { target: { value: 1 } })
      await (global as any).flushPromise(30);
    });
    wrapper.update();
    jest.runAllImmediates()
    expect(buttonNode.text()).toEqual('a:1');
    expect(appBNode.text()).toEqual('a:1');

    await act(async () => {
      buttonReduceNode.simulate("click", { target: { value: 0 } })
      await (global as any).flushPromise(30);
    });
    wrapper.update();
    jest.runAllImmediates()
    expect(buttonNode.text()).toEqual('a:1');
    expect(buttonReduceNode.text()).toEqual('a:Error: err');
    expect(appBNode.text()).toEqual('a:1');

    wrapper.unmount();
    expect(getContext("modelA")).toBe(null)
  })
}) 
