import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

import appLogo from "@/assets/appLogo.svg";

const Header = () => {
  return (
    <header className="bg-background w-full border-b-2 border-blue-400">
      <div className="container mx-2 flex h-20 items-center justify-between px-2">
        <Link href="/">
          <Image src={appLogo} alt="App Logo" height={80} width={80} />
        </Link>

        <SignedOut>
          <SignInButton />
          <SignUpButton>
            <button className="h-10 cursor-pointer rounded-full bg-[#6c47ff] px-4 text-sm font-medium text-white sm:h-12 sm:px-5 sm:text-base">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Header;
