import type { SVGProps } from 'react';

const FormOffIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width='1em'
      height='1em'
      stroke='currentColor'
      strokeWidth='2'
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path d='M5.575 5.597a2 2 0 0 0 -.575 1.403v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2m0 -4v-8a2 2 0 0 0 -2 -2h-2' />
      <path d='M9 5a2 2 0 0 1 2 -2h2a2 2 0 1 1 0 4h-2' />
      <path d='M3 3l18 18' />
    </svg>
  );
};

export default FormOffIcon;
