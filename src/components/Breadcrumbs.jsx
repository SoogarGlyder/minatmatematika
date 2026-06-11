import React from 'react';
import Link from 'next/link';
import styles from './Breadcrumbs.module.css'; 

function Breadcrumbs({ items }) {
  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumbNav}>
      <ol className={styles.breadcrumbList}>
        <li>
          <Link href="/" className={styles.link}>
            Beranda
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className={styles.listItem}>
            <span className={styles.separator}>
                &rsaquo; 
            </span>

            {item.link ? (
              <Link href={item.link} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.activeItem}>
                {item.label}
              </span>
            )}
          </li>
        ))}

      </ol>
    </nav>
  );
}

export default Breadcrumbs;