'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SidebarLink = ({ icon, to, children }: SidebarLinkProps) => {
  const pathname = usePathname();
  return (
    <Link href={to} className={cn('w-full')}>
      <p
        className={cn(
          'flex w-full items-center px-3 py-2 font-medium transition-colors hover:bg-black/5',
          {
            'bg-black/10': pathname === to,
            'hover:bg-black/20': pathname === to,
          }
        )}
      >
        {icon}
        <span className="ml-2 text-xl">{children}</span>
      </p>
    </Link>
  );
};

export default SidebarLink;
