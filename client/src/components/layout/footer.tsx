import { Link } from "wouter";
import { MessageSquareDashed } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E4E6EB] py-4 mt-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-3 md:mb-0">
            <MessageSquareDashed className="text-[#1877F2] h-5 w-5" />
            <span className="text-[#1C1E21] font-medium">AdCreator</span>
          </div>
          <div className="flex gap-4 text-sm text-[#65676B]">
            <Link href="#">
              <a className="hover:text-[#1877F2]">Help Center</a>
            </Link>
            <Link href="#">
              <a className="hover:text-[#1877F2]">Terms of Service</a>
            </Link>
            <Link href="#">
              <a className="hover:text-[#1877F2]">Privacy Policy</a>
            </Link>
            <Link href="#">
              <a className="hover:text-[#1877F2]">Contact Us</a>
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-[#65676B]">
          © {new Date().getFullYear()} AdCreator. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
