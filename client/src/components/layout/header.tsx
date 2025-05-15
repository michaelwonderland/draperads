import { Link, useLocation } from "wouter";
import { Briefcase, Layers } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const [step, setStep] = useState(1);
  
  // Determine current step based on location
  const getStepFromLocation = () => {
    // First step is design
    if (location.startsWith("/create")) {
      return step;
    }
    // Default to step 1
    return 1;
  };
  
  const currentStep = getStepFromLocation();
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Briefcase className="text-[#f6242f] h-6 w-6" />
              <h1 className="text-xl font-semibold text-black">Draper<span className="text-[#f6242f]">Ads</span></h1>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {location.startsWith("/create") && (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className={`w-7 h-7 ${currentStep === 1 ? 'bg-[#f6242f] text-white' : 'bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB]'} rounded-full flex items-center justify-center`}>1</span>
                  <span className={`text-sm ${currentStep === 1 ? 'font-medium text-black' : 'text-[#65676B]'}`}>Design</span>
                </div>
                <div className="w-6 h-0.5 bg-[#E4E6EB]"></div>
                <div className="flex items-center gap-1">
                  <span className={`w-7 h-7 ${currentStep === 2 ? 'bg-[#f6242f] text-white' : 'bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB]'} rounded-full flex items-center justify-center`}>2</span>
                  <span className={`text-sm ${currentStep === 2 ? 'font-medium text-black' : 'text-[#65676B]'}`}>Distribute</span>
                </div>
                <div className="w-6 h-0.5 bg-[#E4E6EB]"></div>
                <div className="flex items-center gap-1">
                  <span className={`w-7 h-7 ${currentStep === 3 ? 'bg-[#f6242f] text-white' : 'bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB]'} rounded-full flex items-center justify-center`}>3</span>
                  <span className={`text-sm ${currentStep === 3 ? 'font-medium text-black' : 'text-[#65676B]'}`}>Launch</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {!location.startsWith("/create") && (
                <Link href="/create">
                  <button className="bg-[#f6242f] text-white px-4 py-2 rounded-md hover:opacity-90 mr-2">
                    Create Ad
                  </button>
                </Link>
              )}
              <Link href="/history">
                <button className={`p-2 text-[#65676B] hover:bg-[#F0F2F5] rounded-full ${location === '/history' ? 'bg-[#F0F2F5]' : ''}`}>
                  <Layers className="h-5 w-5" />
                </button>
              </Link>
              <button className="p-2 text-[#65676B] hover:bg-[#F0F2F5] rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </button>
              <div className="h-8 w-8 rounded-full bg-[#f6242f] overflow-hidden">
                <div className="h-full w-full flex items-center justify-center text-white text-sm">
                  U
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
