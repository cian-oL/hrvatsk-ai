import Link from "next/link";
import Image from "next/image";

import boatImage from "@/assets/404-boat.svg";
import { Button } from "@/components/ui/Button";

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-xl border-2 border-blue-400 p-8 shadow-xl backdrop-blur-sm">
        <div className="text-center">
          <h1 className="mb-2 text-6xl font-bold">404 - Not Found</h1>
        </div>
        <div className="my-8 overflow-hidden rounded-lg">
          <div className="my-8 flex items-center justify-center overflow-hidden rounded-lg">
            <Image src={boatImage} width={400} alt="Sailboat" />
          </div>
        </div>
        <div className="text-center">
          <Button asChild>
            <Link href="/chat">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
