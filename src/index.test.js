import React from 'react';
jest.mock('./App', () => () => <div data-testid="mock-app">Mock App</div>);
jest.mock('./reportWebVitals', () => jest.fn());
jest.mock('react-dom/client'); 
jest.mock('./store/index', () => ({
  store: {},
  persistor: {},
}));

describe('Application Root', () => {
  let ReactDOM;
  let mockRender;

  beforeEach(() => {
   jest.resetModules();

    ReactDOM = require('react-dom/client');
    mockRender = jest.fn();

    ReactDOM.createRoot.mockReturnValue({
      render: mockRender,
    });
  });

  it('should render the App with all the required providers in the correct order', () => {
    const rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
   require('./index.js');

     expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootElement);

     expect(mockRender).toHaveBeenCalledTimes(1);

     const renderedComponentTree = mockRender.mock.calls[0][0];
    expect(renderedComponentTree).toMatchSnapshot();
  });
});

