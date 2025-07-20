"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

import appLogo from "@/assets/appLogo.svg";

type Props = {
  width: number;
  height: number;
};

const LogoWithLink = ({ width, height }: Props) => {
  const { isSignedIn } = useAuth();

  return (
    <Link href={isSignedIn ? "/chat" : "/"}>
      <Image
        src={appLogo}
        alt="App logo"
        width={width}
        height={height}
        className="dark:brightness-100 dark:invert"
      />
    </Link>
  );
};

export default LogoWithLink;
