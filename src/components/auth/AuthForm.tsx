import { SignIn, SignUp, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import Image from "next/image";

import LoadingSpinner from "@/components/ui/loading-spinner";
import landingImage from "@/assets/Miljenko-and-Dobrila.png";

type Props = {
  type: "sign-in" | "sign-up";
};

const AuthForm = ({ type }: Props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="my-6 flex items-center justify-center">
        <ClerkLoading>
          <LoadingSpinner />
        </ClerkLoading>
        <ClerkLoaded>
          {type === "sign-in" ? <SignIn /> : <SignUp />}
        </ClerkLoaded>
      </div>
      <div className="hidden max-h-screen w-full items-center justify-center lg:flex">
        <Image
          src={landingImage}
          alt="Landing image"
          className="max-h-full w-full object-contain"
        />
      </div>
    </div>
  );
};

export default AuthForm;
