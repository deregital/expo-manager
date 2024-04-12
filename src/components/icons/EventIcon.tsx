import * as React from 'react';

const EventIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
        viewBox="0 0 512 512"
      fill="currentColor"
      height="1em"
      width="1em"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={32}
        d="M96 80 H416 A48 48 0 0 1 464 128 V416 A48 48 0 0 1 416 464 H96 A48 48 0 0 1 48 416 V128 A48 48 0 0 1 96 80 z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={32}
        d="M128 48v32M384 48v32"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={32}
        d="M125 224 H195 A13 13 0 0 1 208 237 V307 A13 13 0 0 1 195 320 H125 A13 13 0 0 1 112 307 V237 A13 13 0 0 1 125 224 z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={32}
        d="M464 160H48"
      />
  </svg>
    );

};

export default EventIcon;