import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme'; // Assuming this exists

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Replica Wordle",
  description: "Joshua make one!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: '100%' }}> {/* Add height: '100%' here */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ height: '100%', margin: 0 }} // Add height: '100%' and remove default margin
      >
            {children}
      </body>
    </html>
  );
}