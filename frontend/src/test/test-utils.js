
import { render as rtlRender, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FunctionComponent } from 'react';

import { userGenerator } from './data-generator';

export const loginAsUser = async (user) => {
  
  return {};
};

const initializeUser = async (user) => {
  return null
};

// eslint-disable-next-line import/export
export const render = async (
  ui,
  { route = '/', user, ...renderOptions } = {}
) => {
  // if you want to render the app unauthenticated then pass "null" as the user
  user = await initializeUser(user);

  window.history.pushState({}, 'Test page', route);

  const returnValue = {};
  
  return returnValue;
};

// eslint-disable-next-line import/export
export * from '@testing-library/react';
export { userEvent, rtlRender };