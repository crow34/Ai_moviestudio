import React from 'react';

const ScissorsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75 4.5 5.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m12 12.75 7.5 7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m12 12.75-7.5 7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m12 12.75 7.5-7.5" />
  </svg>
);
export default ScissorsIcon;
