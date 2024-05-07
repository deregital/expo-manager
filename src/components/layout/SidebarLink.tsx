'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface SidebarLinkProps {
  to: string | string[];
  icon: React.ReactNode;
  iconActive?: React.ReactNode;
  textClassName?: string;
  children: React.ReactNode;
}

const SidebarLink = ({
  icon,
  iconActive,
  to,
  children,
  textClassName,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const href = Array.isArray(to) ? to[0] : to;

  const justPathname = `/${pathname.split('/')[1]}`;

  const isActive = Array.isArray(to)
    ? to.includes(justPathname)
    : justPathname === to;

  return (
    <Link href={href} className={cn('w-full text-sidebar-foreground')}>
      <p
        className={cn(
          'flex w-full items-center px-3 py-2 font-medium transition-colors hover:bg-black/5',
          {
            'font-bold': isActive,
          }
        )}
      >
        <span className='w-6'>{isActive ? iconActive : icon}</span>
        <span className={cn('ml-2 text-xl', textClassName)}>{children}</span>
      </p>
    </Link>
  );
};

export default SidebarLink;
