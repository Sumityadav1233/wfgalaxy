import React from 'react';
import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us | WF Galaxy — Shiv Chowk, Janakpur, Nepal',
  description: 'Learn about WF Galaxy, Janakpur’s premier fashion boutique located at Shiv Chowk. Store hours: 7:00 AM – 10:00 PM daily. Contact: 9822039083, 9709141876.',
  openGraph: {
    title: 'About Us | WF Galaxy — Shiv Chowk, Janakpur',
    description: 'Boutique clothing store at Shiv Chowk, Janakpur, Nepal. Premium fashion, streetwear, footwear & luxury outerwear.',
    url: 'https://wfgalaxy.com/about',
    siteName: 'WF Galaxy',
    images: [{ url: '/logo.png', width: 800, height: 800, alt: 'WF Galaxy Logo' }],
    type: 'website',
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    'name': 'WF Galaxy',
    'image': 'https://wfgalaxy.com/logo.png',
    'telephone': ['+9779822039083', '+9779709141876'],
    'email': 'wfgalaxy.nepal@gmail.com',
    'url': 'https://wfgalaxy.com',
    'hasMap': 'https://www.google.com/maps/place/WF+GALAXY/@26.7296091,85.9296929,19z/data=!4m6!3m5!1s0x39ec4100723dc1ff:0x8098f6dd814716d3!8m2!3d26.729636!4d85.9297216!16s%2Fg%2F11mdxqydpc',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Shiv Chowk, PWHH+RVJ',
      'addressLocality': 'Janakpur',
      'postalCode': '45600',
      'addressCountry': 'NP'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '26.729636',
      'longitude': '85.9297216'
    },
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        'opens': '07:00',
        'closes': '22:00'
      }
    ],
    'sameAs': [
      'https://www.tiktok.com/@wf.galaxy3?is_from_webapp=1&sender_device=pc',
      'https://facebook.com/wfgalaxy',
      'https://www.instagram.com/wfgalaxy03?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=='
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}
