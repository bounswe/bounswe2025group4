import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import AllTheProviders from './AllTheProviders';

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export { screen, fireEvent, waitFor } from '@testing-library/react';

// Override render method
export { customRender as render };
