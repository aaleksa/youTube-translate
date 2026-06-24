import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthButton from "./components/auth/AuthButton";
import AuthPanel from "./components/auth/AuthPanel";
import RequireAuth from "./components/auth/RequireAuth";
import { AuthProvider } from "./components/auth/AuthProvider";
import { InterfaceLanguageProvider } from "./components/InterfaceLanguageProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import AppSettingsPanel from "./components/AppSettingsPanel";
import InstallAppButton from "./components/InstallAppButton";
import PwaProvider from "./components/PwaProvider";
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

const APP_NAME = "YouTube Translator";
const APP_DESCRIPTION =
  "Extract and study YouTube video transcripts with AI tools";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Translaty",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#2563eb",
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
      <body className="min-h-full flex flex-col">
        <PwaProvider>
          <ThemeProvider>
            <InterfaceLanguageProvider>
              <AuthProvider>
                <div className="fixed top-4 right-4 z-50 flex items-center gap-2 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)]">
                  <AuthButton />
                  <InstallAppButton />
                  <AppSettingsPanel />
                  <ThemeToggle />
                </div>
                <AuthPanel />
                <RequireAuth>{children}</RequireAuth>
              </AuthProvider>
            </InterfaceLanguageProvider>
          </ThemeProvider>
        </PwaProvider>
      </body>
    </html>
  );
}
