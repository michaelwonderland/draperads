import { Link } from "wouter";
import { Beaker } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E4E6EB] py-4 mt-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-3 md:mb-0">
            <Beaker className="text-[#1877F2] h-5 w-5" />
            <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">AdPotion</span>
          </div>
          <div className="flex gap-4 text-sm text-[#65676B]">
            <Link href="#">
              <span className="hover:text-[#1877F2]">Help Center</span>
            </Link>
            <Link href="#">
              <span className="hover:text-[#1877F2]">Terms of Service</span>
            </Link>
            <Link href="#">
              <span className="hover:text-[#1877F2]">Privacy Policy</span>
            </Link>
            <Link href="#">
              <span className="hover:text-[#1877F2]">Contact Us</span>
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-[#65676B]">
          © {new Date().getFullYear()} AdPotion. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
