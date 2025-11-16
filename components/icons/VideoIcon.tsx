import React from 'react';

const VideoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6ZM3.75 9h16.5m-16.5 6h16.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75v3M7.5 18v2.25m9-18.75v3m0 12.75v2.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 13.5 15 12l-4.5-1.5v3Z" />
  </svg>
);

export default VideoIcon;
