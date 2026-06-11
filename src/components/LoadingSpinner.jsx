import React from 'react';
import styles from './LoadingSpinner.module.css';

function LoadingSpinner({ message = '' }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
<<<<<<< HEAD
      {message && <p style={{ marginLeft: '15px', color: '#555' }}>{message}</p>}
=======
      {message && <p style={{ marginLeft: '15px', color: 'var(--foreground)', opacity: 0.7 }}>{message}</p>}
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
    </div>
  );
}

export default LoadingSpinner;