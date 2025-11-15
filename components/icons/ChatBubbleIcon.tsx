import React from 'react';

const ChatBubbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.056 3 12c0 2.29.99 4.368 2.62 5.823L5.25 21l2.63-1.972A8.93 8.93 0 0 0 12 20.25Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75h.008v.008H12v-.008Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h.008v.008H8.25V12Zm7.5 0h.008v.008H15.75V12Z" />
  </svg>
);

export default ChatBubbleIcon;