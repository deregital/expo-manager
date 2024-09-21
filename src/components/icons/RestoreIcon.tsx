import * as React from 'react';

const RestoreIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      height='1em'
      width='1em'
      {...props}
    >
      <path d='M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 017-7 7 7 0 017 7 7 7 0 01-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.896 8.896 0 0013 21a9 9 0 009-9 9 9 0 00-9-9z' />
    </svg>
  );
};

export default RestoreIcon;
