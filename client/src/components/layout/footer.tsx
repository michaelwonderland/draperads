import { Link } from "wouter";
import { Briefcase } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E4E6EB] py-4 mt-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-3 md:mb-0">
            <Briefcase className="text-[#f6242f] h-5 w-5" />
            <span className="font-medium text-black">Draper<span className="text-[#f6242f]">Ads</span></span>
          </div>
          <div className="flex gap-4 text-sm text-[#65676B]">
            <Link href="#">
              <span className="hover:text-[#f6242f]">Help Center</span>
            </Link>
            <Link href="#">
              <span className="hover:text-[#f6242f]">Terms of Service</span>
            </Link>
            <Link href="#">
              <span className="hover:text-[#f6242f]">Privacy Policy</span>
            </Link>
            <Link href="#">
              <span className="hover:text-[#f6242f]">Contact Us</span>
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-[#65676B]">
          © {new Date().getFullYear()} DraperAds. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
