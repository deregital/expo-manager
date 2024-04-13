import * as React from 'react';

const StampIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg fill='none' viewBox='0 0 15 15' height='1em' width='1em' {...props}>
      <path
        fill='currentColor'
        d='M4 3.5a3.5 3.5 0 115 3.163V9h3.5a2.5 2.5 0 012.5 2.5V13H0v-1.5A2.5 2.5 0 012.5 9H6V6.663A3.5 3.5 0 014 3.5zM0 14v1h15v-1H0z'
      />
    </svg>
  );
};

export default StampIcon;
