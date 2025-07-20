"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";

import TanstackProvider from "@/providers/TanstackProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl={
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
      }
      signUpFallbackRedirectUrl={
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
      }
      afterSignOutUrl="/"
      appearance={{ baseTheme: shadesOfPurple }}
    >
      <TanstackProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </TanstackProvider>
    </ClerkProvider>
  );
};

export default Providers;
