'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import logo from '@/public/logo.svg';

export default function Header() {
  const pathname = usePathname();

  const isActive = (linkPath: string) => {
    return pathname === linkPath;
  };

  return (
    <div className="header bg-[#1492c8] py-2.5">
      <div className="container mx-auto px-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image src={logo} width={150} height={150} alt="Logo" />
          {/* <h3 className="text-white font-bold  text-1xl">
            {isActive('/') && 'Excel Merging'}
            {isActive('/invoice-merging') && 'Invoice Merging'}
          </h3> */}
        </div>
        <nav>
          <ul className="flex space-x-8">
            <li>
              <Link
                href="/"
                className={`text-lg transition duration-200 ${
                  isActive('/')
                    ? 'text-yellow-300 font-bold'
                    : 'text-white hover:text-yellow-200'
                }`}
              >
                Excel Merging
              </Link>
            </li>
            <li>
              <Link
                href="/generate-billing"
                className={`text-lg transition duration-200 ${
                  isActive('/generate-billing')
                    ? 'text-yellow-300 font-bold'
                    : 'text-white hover:text-yellow-200'
                }`}
              >
                Generate Billing File
              </Link>
            </li>
            <li>
              <Link
                href="/invoice-merging"
                className={`text-lg transition duration-200 ${
                  isActive('/invoice-merging')
                    ? 'text-yellow-300 font-bold'
                    : 'text-white hover:text-yellow-200'
                }`}
              >
                Invoice Merging
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
