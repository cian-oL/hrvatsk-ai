import { SignIn, SignUp, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import Image from "next/image";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import landingImage from "@/../public/Miljenko-and-Dobrila.png";

type Props = {
  type: "sign-in" | "sign-up";
};

const AuthForm = ({ type }: Props) => {
  return (
    <div className="relative grid min-h-full grid-cols-1 lg:grid-cols-2">
      <div className="z-10 my-6 flex items-center justify-center">
        <ClerkLoading>
          <LoadingSpinner />
        </ClerkLoading>
        <ClerkLoaded>
          {type === "sign-in" ? <SignIn /> : <SignUp />}
        </ClerkLoaded>
      </div>
      <div className="absolute inset-0 z-0 h-full w-full lg:static lg:flex">
        <Image
          src={landingImage}
          alt="Landing image"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
};

export default AuthForm;
