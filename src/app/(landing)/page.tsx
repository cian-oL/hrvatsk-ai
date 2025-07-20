import Image from "next/image";
import Link from "next/link";

import landingImage from "@/../public/Miljenko-and-Dobrila.png";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const LandingPage = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center md:justify-center md:bg-[url('/Miljenko-and-Dobrila.png')] md:bg-cover md:bg-center">
      <Image
        src={landingImage}
        alt="An Irish Miljenko and Croatian Dobrila meet outside Kastela"
        className="max-w-3xl md:hidden"
      />
      <Card className="my-4 w-4/5 -translate-y-28 transform justify-center border-b-2 border-blue-400 bg-gray-200/50 sm:max-w-100 md:-translate-y-0">
        <CardHeader>
          <CardTitle className="text-primary-foreground font-extrabold">
            Welcome to Hrvatsk-AI
          </CardTitle>
          <CardDescription className="font-semibold text-blue-900 italic">
            Your interactive AI companion to learn Croatian with!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between">
          <Button asChild className="w-full">
            <Link href="/sign-in">Get Started</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPage;
