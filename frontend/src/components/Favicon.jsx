import React, { useEffect } from 'react';

function Favicon() {
  useEffect(() => {
    // Create high-res canvas for favicon
    const size = 128; // High-res size
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = '#181c20';
    ctx.fillRect(0, 0, size, size);

    // Draw 'b' letter
    ctx.fillStyle = '#f6c177'; // Using our theme's yellow
    ctx.font = 'bold 96px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('b', size / 2, size / 2);

    // Draw dot
    ctx.fillStyle = '#b7c9ce'; // Using our theme's gray
    ctx.beginPath();
    ctx.arc(size * 0.75, size * 0.22, size * 0.0625, 0, Math.PI * 2); // 8px at 128
    ctx.fill();

    // Create a 32x32 canvas for the favicon
    const faviconCanvas = document.createElement('canvas');
    faviconCanvas.width = 32;
    faviconCanvas.height = 32;
    const faviconCtx = faviconCanvas.getContext('2d');
    faviconCtx.drawImage(canvas, 0, 0, 32, 32);

    // Convert to favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = faviconCanvas.toDataURL();
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  return null;
}

export default Favicon; 