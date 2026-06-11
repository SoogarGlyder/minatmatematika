'use client';

import React, { useEffect, useState } from 'react';

const ReadingProgressBar = () => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let animationFrameId;

    const updateProgress = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const totalScrollable = scrollHeight - clientHeight;

      if (totalScrollable <= 0) {
        setWidth(0);
        return;
      }

      const percent = (currentScroll / totalScrollable) * 100;
      const constrainedPercent = Math.min(100, Math.max(0, percent));
      setWidth(constrainedPercent);
    };

    const onScroll = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (width === 0) return null;

  return (
    <div 
      style={{
        position: 'absolute',
        top: 'var(--total-header-height)',
        left: 0,
        width: `${width}%`,
        height: '4px', 
        backgroundColor: 'var(--primary, #38b6ff)',
        zIndex: 1002, 
        transition: 'width 0.1s ease-out',
        borderTopRightRadius: '2px',
        borderBottomRightRadius: '2px',
        pointerEvents: 'none',
      }} 
    />
  );
};

export default ReadingProgressBar;