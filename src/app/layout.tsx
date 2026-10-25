import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Student Boy's Hostel",
    template: "%s | Student Boy's Hostel",
  },
  description:
    "Student Boy's Hostel management portal for managing residents, rooms, fees, payments, and expenses.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <Suspense
          fallback={<div className="p-6 text-gray-600">Loading page...</div>}
        >
          {children}
        </Suspense>
      </body>
    </html>
  );
}
