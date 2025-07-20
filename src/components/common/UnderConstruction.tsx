import Link from "next/link";
import Image from "next/image";

import constructionCrane from "@/assets/construction-crane.svg";
import { Button } from "@/components/ui/Button";

const UnderConstruction = () => {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-xl border-2 border-blue-400 p-8 shadow-xl backdrop-blur-sm">
        <h1 className="mb-4 text-center text-6xl font-bold">
          Under Construction
        </h1>
        <div className="my-8 flex items-center justify-center overflow-hidden rounded-lg">
          <Image src={constructionCrane} width={500} alt="Construction Crane" />
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

export default UnderConstruction;
