import * as React from 'react';

const StampIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg fill='none' viewBox='0 0 15 15' height='1em' width='1em' {...props}>
      <path
        stroke='currentColor'
        d='M0 14.5h15m-8.5-8v3m2-3v3m-1-3a3 3 0 110-6 3 3 0 010 6zm-7 6v-1a2 2 0 012-2h10a2 2 0 012 2v1H.5z'
      />
    </svg>
  );
};

export default StampIcon;
