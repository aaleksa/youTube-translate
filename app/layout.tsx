import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InterfaceLanguageProvider } from "./components/InterfaceLanguageProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import AppSettingsPanel from "./components/AppSettingsPanel";
import ThemeToggle from "./components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YouTube Translator",
  description: "Extract and study YouTube video transcripts with AI tools",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <InterfaceLanguageProvider>
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)]">
              <AppSettingsPanel />
              <ThemeToggle />
            </div>
            {children}
          </InterfaceLanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
