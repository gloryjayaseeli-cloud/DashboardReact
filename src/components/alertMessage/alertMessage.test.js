import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlertMessage from './AlertMessage';

describe('AlertMessage Component', () => {

  test('should render the alert message with the default info variant', () => {
    const message = 'This is an informational message.';
    render(<AlertMessage message={message} />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();

    expect(alertElement).toHaveClass('alert-info');
  });

  test('should render the alert with a specific variant class', () => {
    const message = 'Success!';
    const variant = 'success';
    render(<AlertMessage message={message} variant={variant} />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveClass(`alert-${variant}`);
    expect(alertElement).not.toHaveClass('alert-info');
  });
  test('should call the onClose function when the close button is clicked', () => {
    const message = 'This is a closable message.';
    const handleClose = jest.fn();

    render(<AlertMessage message={message} onClose={handleClose} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
  test('should not render anything if no message prop is provided', () => {

    const { container } = render(<AlertMessage />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  test('should render correctly with a danger variant', () => {
    const message = 'This is a danger alert.';
    render(<AlertMessage message={message} variant="danger" />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveClass('alert-danger');
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
