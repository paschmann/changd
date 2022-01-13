import { configure } from 'enzyme';
import { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Login from './Login';

configure({ adapter: new Adapter() });

describe('Login Page', function() {
  const username = 'paul@paups.com';
  const password = '123';
  const clickFn = jest.fn();

  it('should render without throwing an error', function() {
    //expect(shallow(<Login />).contains("Login")).toBe(true);
    const component = shallow(<Login />);
    expect(component).toMatchSnapshot();
  });

  it('button click should hide component', () => {
    const component = shallow(<Login onSubmit={clickFn} />);
    component.find({ "data-testid": 'email-input' }).simulate('change', {target: {value: username}});
    component.find({ "data-testid": 'password-input' }).simulate('change', {target: {value: password}});
    component.find({ "data-testid": 'login-form' }).simulate('submit');

    expect(clickFn).toHaveBeenCalled();
    expect(clickFn).toHaveBeenCalledWith({
      username,
      password
    });
  });
});