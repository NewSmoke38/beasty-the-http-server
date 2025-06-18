import React, { useEffect } from 'react';

function Favicon() {
  useEffect(() => {
    // Draw directly at 32x32 for sharpness
    const size = 32;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = '#181c20';
    ctx.fillRect(0, 0, size, size);

    // Draw 'b' letter
    ctx.fillStyle = '#f6c177';
    ctx.font = 'bold 24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('b', size / 2, size / 2 + 2); // +2 for better vertical centering

    // Draw dot
    ctx.fillStyle = '#b7c9ce';
    ctx.beginPath();
    ctx.arc(size * 0.75, size * 0.22, size * 0.0625 * 4, 0, Math.PI * 2); // 2px at 32
    ctx.fill();

    // Convert to favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL();
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  return null;
}

export default Favicon; 