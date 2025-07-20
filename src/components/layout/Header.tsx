import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

import LogoWithLink from "@/components/layout/LogoWithLink";
import { Button } from "@/components/ui/Button";
import UserDropdownMenu from "@/components/layout/UserDropdownMenu";
import ModeToggle from "@/components/layout/ModeToggle";

const Header = () => {
  return (
    <header className="bg-background w-full border-b-2 border-blue-400">
      <div className="container mx-auto flex h-24 items-center justify-between px-2">
        <LogoWithLink width={100} height={80} />
        <div className="flex items-center gap-2">
          <ModeToggle />

          {/* Dynamic rendering from Clerk */}
          <SignedOut>
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <UserDropdownMenu />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Header;
