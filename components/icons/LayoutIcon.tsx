import React from 'react';

const LayoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5h16.5V3.75H3.75Zm0 9h16.5m-16.5-4.5h4.5m-4.5 9h4.5m12-9h-4.5m4.5 9h-4.5" />
  </svg>
);

export default LayoutIcon;
