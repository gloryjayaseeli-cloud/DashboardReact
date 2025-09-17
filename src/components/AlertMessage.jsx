import React from 'react';

function AlertMessage({ variant = 'info', message, onClose }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`alert alert-${variant} alert-dismissible fade show`} role="alert">
      {message}
      <button 
        type="button" 
        className="btn-close" 
        onClick={onClose} 
        aria-label="Close"
      ></button>
    </div>
  );
}

export default AlertMessage;