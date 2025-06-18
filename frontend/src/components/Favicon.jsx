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

    // Draw 'b' letter (bigger for visibility)
    ctx.fillStyle = '#f6c177';
    ctx.font = 'bold 96px "Press Start 2P"'; // Larger 'b'
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('b', size / 2, size / 2 + 8); // +8 for better vertical centering

    // Draw dot (attached to 'b', bigger and closer)
    ctx.fillStyle = '#ff4b6e'; // Red dot
    ctx.beginPath();
    ctx.arc(size * 0.72, size * 0.36, size * 0.0625 * 2, 0, Math.PI * 2); // 4px at 128, attached to 'b'
    ctx.fill();

    // Create a 32x32 canvas for the favicon
    const faviconCanvas = document.createElement('canvas');
    faviconCanvas.width = 32;
    faviconCanvas.height = 32;
    const faviconCtx = faviconCanvas.getContext('2d');
    // Enable image smoothing for polished look
    faviconCtx.imageSmoothingEnabled = true;
    faviconCtx.imageSmoothingQuality = 'high';
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