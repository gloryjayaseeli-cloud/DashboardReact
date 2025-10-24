import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
const mockSelectUsername = jest.fn();
const mockSelectUserRole = jest.fn();

jest.doMock('../src/features/UserSlice/user', () => ({
    selectUsername: mockSelectUsername,
    selectUserRole: mockSelectUserRole,
}), { virtual: true });

jest.doMock('../src/store', () => ({
    persistor: {
        purge: jest.fn(() => Promise.resolve()),
    },
}), { virtual: true });

const renderWithProviders = (ui) => {
    const store = configureStore({
        reducer: {
           
            user: (state = { name: null, role: null }) => state,
            auth: (state = {}) => state,
            projects: (state = {}) => state,
        },
    });
    return render(
        <Provider store={store}>
            <MemoryRouter>{ui}</MemoryRouter>
        </Provider>
    );
};

describe('App Component', () => {
    beforeEach(() => {
        mockSelectUsername.mockClear();
        mockSelectUserRole.mockClear();
    });
    
    test('renders the App component without crashing', () => {
        mockSelectUsername.mockReturnValue(null);
        renderWithProviders(<App />);
        
         expect(screen.getByText(/Project Tracker/i)).toBeInTheDocument();
    });
});

