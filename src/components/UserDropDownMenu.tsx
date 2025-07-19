"use client";

import { CircleUser } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

import { useGetUser } from "@/hooks/useUserData";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserDropDownMenu = () => {
  const { data: user } = useGetUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <CircleUser className="h-8 w-10" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="font-extrabold underline">
          {user?.firstName ? `${user.firstName}'s Account` : "My Account"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/profile">My Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropDownMenu;
