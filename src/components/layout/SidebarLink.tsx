'use client';
import { useSidebar } from '@/components/layout/MobileSidebar';
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
  endDecorator?: React.ReactNode;
}

const SidebarLink = ({
  icon,
  iconActive,
  to,
  children,
  textClassName,
  endDecorator,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const href = Array.isArray(to) ? to[0] : to;

  const justPathname = `/${pathname.split('/')[1]}`;

  const isActive = Array.isArray(to)
    ? to.includes(justPathname)
    : justPathname === to;

  return (
    <Link
      href={href}
      onClick={() => {
        useSidebar.setState({ isOpen: false });
      }}
      className={cn(
        'flex w-full items-center justify-between px-3 py-2 text-sidebar-foreground transition-colors hover:bg-black/5'
      )}
    >
      <p
        className={cn('flex w-full items-center font-medium', {
          'font-bold': isActive,
        })}
      >
        <span className='w-6'>{isActive ? iconActive : icon}</span>
        <span
          className={cn('ml-2 text-xl', textClassName, 'whitespace-nowrap')}
        >
          {children}
        </span>
      </p>
      {endDecorator ?? <></>}
    </Link>
  );
};

export default SidebarLink;
