import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

import appLogo from "@/assets/appLogo.svg";
import { Button } from "@/components/ui/Button";
import UserDropdownMenu from "@/components/layout/UserDropdownMenu";

const Header = () => {
  return (
    <header className="bg-background w-full border-b-2 border-blue-400">
      <div className="container mx-2 flex h-24 items-center justify-between px-2">
        <Link href="/chat">
          <Image src={appLogo} alt="App Logo" height={80} width={100} />
        </Link>
        <div className="flex items-center gap-2">
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
