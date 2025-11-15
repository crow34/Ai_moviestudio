import React from 'react';

const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-3.77 1.347l-2.553 4.255a.75.75 0 0 0 1.226 1.226l4.255-2.553a3 3 0 0 0 1.347-3.771l-1.505-2.507Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 1.5a4.5 4.5 0 0 0-6.364 0L11.25 3.386m5.657 5.657 2.121-2.121a4.5 4.5 0 0 0-6.364-6.364l-2.121 2.121" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-2.121-2.121M16.5 6.375l-2.121-2.121" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.625 18.375l-2.121-2.121" />
  </svg>
);

export default WandIcon;
