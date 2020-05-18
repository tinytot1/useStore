import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

// Ref https://github.com/facebook/jest/issues/2157#issuecomment-279171856
// Ref https://github.com/enzymejs/enzyme/issues/2073#issuecomment-531488981
(global as any).flushPromise = (ms = 0) => new Promise(resolve => setImmediate(resolve, ms));