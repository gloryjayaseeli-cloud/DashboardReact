import React from 'react';
import { screen } from '@testing-library/react';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { renderWithProviders } from './test-utils';
const SimpleComponent = () => <div>Simple Component Content</div>;
const ReduxComponent = () => {
  const value = useSelector((state) => state.test.value);
  return <div>Redux Value: {value}</div>;
};

const RouterComponent = () => {
  const { id } = useParams();
  const location = useLocation();
  return (
    <div>
      <p>Param ID: {id}</p>
      <p>Current Path: {location.pathname}</p>
    </div>
  );
};
const testSlice = createSlice({
  name: 'test',
  initialState: { value: 'initial' },
  reducers: {},
});

const testReducer = testSlice.reducer;

describe('renderWithProviders Utility', () => {

  it('should render the UI component correctly', () => {
    renderWithProviders(<SimpleComponent />);
    expect(screen.getByText('Simple Component Content')).toBeInTheDocument();
  });

  it('should provide a default Redux store if none is passed', () => {
     const DefaultStoreComponent = () => {
      const tasksState = useSelector(state => state.tasks);
      return <div>Tasks state exists: {tasksState ? 'Yes' : 'No'}</div>;
    };

    renderWithProviders(<DefaultStoreComponent />);
    expect(screen.getByText('Tasks state exists: Yes')).toBeInTheDocument();
  });

  it('should use the provided custom Redux store', () => {
    const customStore = configureStore({
      reducer: { test: testReducer },
      preloadedState: { test: { value: 'custom value' } },
    });

    renderWithProviders(<ReduxComponent />, { store: customStore });
    expect(screen.getByText('Redux Value: custom value')).toBeInTheDocument();
  });

  it('should set up the router with default route and path', () => {
    const DefaultRouterComponent = () => {
        const location = useLocation();
        return <div>Path: {location.pathname}</div>;
    }

    renderWithProviders(<DefaultRouterComponent />);
    expect(screen.getByText('Path: /')).toBeInTheDocument();
  });

  it('should use the provided custom route and path for the router', () => {
    renderWithProviders(<RouterComponent />, {
      route: '/items/42',
      path: '/items/:id',  
    });


    expect(screen.getByText('Param ID: 42')).toBeInTheDocument();
    expect(screen.getByText('Current Path: /items/42')).toBeInTheDocument();
  });

  it('should return the store instance used in the render', () => {
    const { store } = renderWithProviders(<SimpleComponent />);
    expect(store).toBeDefined();
    expect(store.getState()).toHaveProperty('tasks');
  });
});

