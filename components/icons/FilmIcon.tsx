import React from 'react';

const FilmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75v16.5M16.5 3.75v16.5M3.75 12h16.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h-1.5m1.5 6H2.25m18-6h1.5m-1.5 6h1.5" />
  </svg>
);

export default FilmIcon;
