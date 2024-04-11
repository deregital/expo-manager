'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface SidebarLinkProps {
  to: string;
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
  return (
    <Link href={to} className={cn('w-full text-sidebar-foreground')}>
      <p
        className={cn(
          'flex w-full items-center px-3 py-2 font-medium transition-colors hover:bg-black/5',
          {
            'font-bold': pathname === to,
          }
        )}
      >
        <span className='w-6'>{pathname === to ? iconActive : icon}</span>
        <span className={cn('ml-2 text-xl', textClassName)}>{children}</span>
      </p>
    </Link>
  );
};

export default SidebarLink;
