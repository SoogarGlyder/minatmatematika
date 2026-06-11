// File: src/app/admin/layout.jsx
import React from 'react';

export const metadata = {
  title: 'Admin Panel | Minat Matematika',
  description: 'Halaman dashboard untuk administrator.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return (
    <>
      {children}
    </>
  );
}