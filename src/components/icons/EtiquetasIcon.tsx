import * as React from 'react';

const EtiquetasIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill='currentColor'
      viewBox='0 0 16 16'
      height='1em'
      width='1em'
      {...props}
    >
      <path d='M3 2v4.586l7 7L14.586 9l-7-7H3zM2 2a1 1 0 011-1h4.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-4.586 4.586a1 1 0 01-1.414 0l-7-7A1 1 0 012 6.586V2z' />
      <path d='M5.5 5a.5.5 0 110-1 .5.5 0 010 1zm0 1a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM1 7.086a1 1 0 00.293.707L8.75 15.25l-.043.043a1 1 0 01-1.414 0l-7-7A1 1 0 010 7.586V3a1 1 0 011-1v5.086z' />
    </svg>
  );
};

export default EtiquetasIcon;
