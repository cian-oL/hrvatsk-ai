import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TanstackProvider from "@/providers/TanstackProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hrvatsk-AI",
  description: "Chat and learn Croatian",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl={
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_UR
      }
      signUpFallbackRedirectUrl={
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_UR
      }
      afterSignOutUrl="/"
      appearance={{ baseTheme: shadesOfPurple }}
    >
      <TanstackProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
          >
            <Header />
            <main className="flex flex-1 flex-col items-center justify-center">
              {children}
            </main>
            <Footer />
            <Toaster />
          </body>
        </html>
      </TanstackProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
