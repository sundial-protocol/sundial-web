"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="210"
                  height="46"
                  fill="none"
                  viewBox="0 0 500 80"
                >
                  <path
                    fill="#FFB70A"
                    d="M132.91 1.82c2.56 0 5-.09 7.35.07a3.43 3.43 0 0 1 2 1.28q19.08 21.81 38.11 43.66a2 2 0 0 0 3.51-1.25v-.27c0-13.41-.07-26.82-.05-40.23 0-.6.62-1.72 1-1.73 3.55-.13 7.11-.08 10.64-.08v64.45c0 3.55-.07 3.42-3.66 3.65a8 8 0 0 1-6.59-2.77c-12.12-14.12-24.42-28.09-36.73-42.05a2.2 2.2 0 0 0-.39-.36 2.273 2.273 0 0 0-3.186.561 2.3 2.3 0 0 0-.394 1.119q.008.1 0 .2c-.06 12.75 0 25.49-.06 38.24 0 3.43-.09 3.51-3.49 3.53h-4.5c-3.47 0-3.52-.05-3.52-3.47V24.89zM209 3.5a6.6 6.6 0 0 1 1.16-.21c8.32.17 16.67-.06 24.94.62 15.31 1.24 27.35 14 28.44 29.33q1.33 19-13.75 30.39a30.64 30.64 0 0 1-17.2 6c-7.06.36-14.14.11-21.22.21-2.4 0-2.39-1.44-2.38-3.13V23.5zm11.47 32.78v19a8.8 8.8 0 0 0 .4 3.43 4.25 4.25 0 0 0 3 1.57c5.18-.58 9.82-.27 14.56-2.1 8.51-3.28 12.09-10.77 13.23-19.44a22.493 22.493 0 0 0-17.62-25.1 54 54 0 0 0-9.68-.84c-3.24-.1-3.94.76-3.93 4q.06 9.73.04 19.48M63.84 3.44h11.58v41.440000000000005c.05 6.28 2 11.83 7.9 14.89 8.42 4.41 21.28 1 21.93-12.34.68-14 .26-28.14.39-42.21 0-.64.75-1.81 1.18-1.83 3.47-.15 6.95-.09 10.45-.09v5.21c-.11 12.75-.18 25.49-.34 38.24-.22 18.11-14.31 26.06-29.25 24.8-6.64-.56-12.58-2.82-17.32-7.88-5.1-5.45-6.41-12.12-6.5-19.14-.15-11.58-.05-23.17-.05-34.75zM42.55 7.02c-1.52 1.81-3 3.51-4.39 5.23s-2.59.83-3.88-.09a13.73 13.73 0 0 0-12.06-2.39c-3.91 1-6.59 3.76-6.91 7-.37 3.79 1.42 6.71 5.54 8.57 4.62 2.09 9.43 3.79 14 6 8.22 4.11 11.28 9.72 10.47 18.32-.84 8.89-6.38 16.17-14.14 18.54-10.79 3.29-20.19 1.07-28.11-7.09-1-1-2.08-1.88-3-2.74l6.82-7c2.78 2.27 5.29 4.83 8.28 6.63 3.42 2.05 7.41 2 11.14.7 4.23-1.46 6.5-4.73 7.12-9.14s-1.53-7.45-5.29-9.26c-4.5-2.16-9.13-4-13.73-6-7.78-3.29-11.25-8.51-11-16.65a17.54 17.54 0 0 1 12.2-16.29C24.92-1.69 33.5.11 41.37 5.75q.635.594 1.18 1.27M384.91 4.28h11.7v46.31c0 2.58.08 5.16.06 7.74 0 2.28.94 3.28 3.33 3.22 4.92-.12 9.83 0 14.75 0 .87 0 1.75.11 2.65.16-.586 2.416-1.3 4.8-2.14 7.14a3.41 3.41 0 0 1-2.47 1.79c-8.5.13-17 0-25.5.11-2.35 0-2.44-1.36-2.44-3.1V22.16zM291.58 3.33v20.76c0 4.66.2 9.32.21 14v29.43c0 1.73-.78 2.4-2.42 2.38-2.09 0-4.17-.11-6.25 0-2.23.14-2.86-.86-2.85-3q.09-15 0-30c0-10.73-.16-21.46-.18-32.19 0-.49.58-1.38.91-1.39 3.64-.04 7.27.01 10.58.01M358.91 3.28l-52.62 66h52.62z"
                  ></path>
                  <path
                    fill="#FFB70A"
                    d="m386.91 88.77-28-19.49h-52z"
                    opacity="0.4"
                  ></path>
                </svg>
              </div>
            </Link>
            <p className="text-sm text-gray-500">
              Unlock Bitcoin&apos;s $1.5 Trillion Potential with Sundial.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Products</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/staking"
                  className="text-gray-500 hover:text-gray-900"
                >
                  Staking
                </Link>
              </li>
              <li>
                <Link
                  href="/liquid-staking"
                  className="text-gray-500 hover:text-gray-900"
                >
                  Liquid Staking
                </Link>
              </li>
              <li>
                <Link
                  href="/validators"
                  className="text-gray-500 hover:text-gray-900"
                >
                  Validators
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/docs"
                  className="text-gray-500 hover:text-gray-900"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/faq"
                  className="text-gray-500 hover:text-gray-900"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/guides"
                  className="text-gray-500 hover:text-gray-900"
                >
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://x.com/SundialProtocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900"
                >
                  X
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ikigai-github"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500">
          <p>
            © Copyright SUNDIAL {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
