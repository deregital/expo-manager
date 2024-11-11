import * as React from 'react';

const IconDatabase = (
  props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      viewBox='0 0 24 24'
      height='1em'
      width='1em'
      {...props}
    >
      <path d='M21 5 A9 3 0 0 1 12 8 A9 3 0 0 1 3 5 A9 3 0 0 1 21 5 z' />
      <path d='M3 5v14a9 3 0 0018 0V5M3 12a9 3 0 0018 0' />
    </svg>
  );
};

export default IconDatabase;
