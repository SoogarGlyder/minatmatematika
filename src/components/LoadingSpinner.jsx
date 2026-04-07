import React from 'react';
import styles from './LoadingSpinner.module.css';

function LoadingSpinner({ message = '' }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      {message && <p style={{ marginLeft: '15px', color: 'var(--foreground)', opacity: 0.7 }}>{message}</p>}
    </div>
  );
}

export default LoadingSpinner;