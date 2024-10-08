import * as React from 'react';

const MapFillIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill='currentColor'
      viewBox='0 0 16 16'
      height='1em'
      width='1em'
      {...props}
    >
      <path
        fillRule='evenodd'
        d='M16 .5a.5.5 0 00-.598-.49L10.5.99 5.598.01a.5.5 0 00-.196 0l-5 1A.5.5 0 000 1.5v14a.5.5 0 00.598.49l4.902-.98 4.902.98a.502.502 0 00.196 0l5-1A.5.5 0 0016 14.5V.5zM5 14.09V1.11l.5-.1.5.1v12.98l-.402-.08a.498.498 0 00-.196 0L5 14.09zm5 .8V1.91l.402.08a.5.5 0 00.196 0L11 1.91v12.98l-.5.1-.5-.1z'
      />
    </svg>
  );
};

export default MapFillIcon;
