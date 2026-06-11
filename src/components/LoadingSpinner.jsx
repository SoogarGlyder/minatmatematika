import React from 'react';
import styles from './LoadingSpinner.module.css';

function LoadingSpinner({ message = '' }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      {message && <p style={{ marginLeft: '15px', color: '#555' }}>{message}</p>}
    </div>
  );
}

export default LoadingSpinner;