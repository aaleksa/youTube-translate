import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'YouTube Translator',
    short_name: 'Translaty',
    description:
      'Extract and study YouTube video transcripts with AI-powered learning tools',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#eff6ff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
