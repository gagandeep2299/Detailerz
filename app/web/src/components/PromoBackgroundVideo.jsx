import React from 'react';

/**
 * PromoBackgroundVideo
 * Renders a full‑screen background video that plays automatically, loops, and stays fixed while scrolling.
 * The video file should be placed in the public folder at `public/promo/kit.mp4` (or the path you provide).
 * If the video fails to load, the component silently renders nothing – you may add a fallback poster image if desired.
 */
export default function PromoBackgroundVideo() {
  // Using the public folder: the URL is relative to the site root.
  const videoSrc = '/promo/kit.mp4';
  const posterSrc = '/promo/poster.jpg'; // optional static image fallback

  return (
    <video
      className="fixed inset-0 z-0 w-full h-full object-cover pointer-events-none opacity-70"
      src={videoSrc}
      poster={posterSrc}
      autoPlay
      muted
      loop
      playsInline
    />
  );
}
