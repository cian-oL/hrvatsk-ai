import landingImage from "@/assets/Miljenko-and-Dobrila.png";
import appLogo from "@/assets/appLogo.svg";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div
      className="flex h-screen w-full items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${landingImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Card className="bg-background w-2/3 -translate-y-32 transform border-b-2 border-blue-400 sm:max-w-100">
        <CardHeader>
          <CardTitle>Welcome to Hrvatsk-AI</CardTitle>
          <CardDescription>
            Your interactive AI companion to learn Croatian with!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between">
          <Button asChild>
            <Link href="/login">Get Started</Link>
          </Button>
          <Image
            src={appLogo}
            alt="App Logo"
            className="h-16 dark:brightness-100 dark:invert"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPage;
