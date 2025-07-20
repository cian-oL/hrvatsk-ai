import Link from "next/link";
import Image from "next/image";
import { FaGithub, FaLinkedin } from "react-icons/fa";

import appLogo from "@/assets/appLogo.svg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="h-20 w-full border-t-2 border-blue-400 lg:block">
      <div className="container mx-auto px-4 py-8 text-blue-900">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col">
            <div className="mb-4">
              <Link href={"/chat"}>
                <Image src={appLogo} alt="App logo" className="h-30 w-30" />
              </Link>
            </div>
            <p className="text-sm italic">
              Your interactive AI companion to learn Croatian with!
            </p>
          </div>
          <div className="flex flex-col">
            <h3 className="mb-4 font-extrabold">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/chat" className="text-sm hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-sm hover:underline"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-sm hover:underline">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h3 className="mb-4 font-extrabold">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/cian-oL"
                target="_blank"
                aria-label="GitHub"
                className="hover:text-primary"
              >
                <FaGithub className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/cianoleary/"
                target="_blank"
                aria-label="LinkedIn"
                className="hover:text-primary"
              >
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-blue-400 pt-4">
          <p className="text-center text-xs">
            &copy; {currentYear} Created by{" "}
            <a href="https://olearylab.com" target="_blank">
              olearylab.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
