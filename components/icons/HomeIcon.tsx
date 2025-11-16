import React from 'react';

const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.5 1.5 0 0 1 2.122 0l8.954 8.955M3 10.5v.75a3 3 0 0 0 3 3h1.5a3 3 0 0 0 3-3v-.75m-9 3.75h15M9 21v-6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v6" />
  </svg>
);

export default HomeIcon;