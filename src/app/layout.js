import ThemeRegistry from '@/components/ThemeRegistry';
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SITI",
  description: "Sistema Integral de Tecnologias de la Información",
  icons: {
    icon: '/favicon.svg'
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeRegistry>
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </ThemeRegistry>
      </body>
    </html>
  );
}
