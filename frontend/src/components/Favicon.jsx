import React, { useEffect } from 'react';

function Favicon() {
  useEffect(() => {
    // Create canvas for favicon
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = '#181c20';
    ctx.fillRect(0, 0, 32, 32);

    // Draw 'b' letter
    ctx.fillStyle = '#f6c177'; // Using our theme's yellow
    ctx.font = 'bold 24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('b', 16, 16);

    // Draw dot
    ctx.fillStyle = '#b7c9ce'; // Using our theme's gray
    ctx.beginPath();
    ctx.arc(22, 10, 2, 0, Math.PI * 2);
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