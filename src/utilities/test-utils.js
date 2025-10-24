
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const dummyReducer = (state = {}) => state;

function renderWithProviders(
  ui,
  {
    store = configureStore({ reducer: { tasks: dummyReducer } }),
    route = '/',
    path = '/',
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={children} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  }

 return { store, ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export * from '@testing-library/react';
export { renderWithProviders };