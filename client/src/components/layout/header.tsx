import { Link, useLocation } from "wouter";
import { Briefcase, Layers, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AuthDialog } from "@/components/auth/auth-dialog";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Get the current step from local storage
  const getCurrentStep = () => {
    if (typeof window !== 'undefined') {
      const storedStep = localStorage.getItem('adCreatorStep');
      return storedStep ? parseInt(storedStep, 10) : 1;
    }
    return 1;
  };
  
  // Add useEffect to update when localStorage changes
  useEffect(() => {
    const checkForUpdates = () => {
      const storedStep = localStorage.getItem('adCreatorStep');
      if (storedStep) {
        setStep(parseInt(storedStep, 10));
      }
    };
    
    // Check immediately
    checkForUpdates();
    
    // Set up an interval to check periodically
    const intervalId = setInterval(checkForUpdates, 200);
    
    // Clean up
    return () => clearInterval(intervalId);
  }, []);
  
  const [step, setStep] = useState(getCurrentStep());
  const currentStep = step;
  
  // Handle login button click
  const handleLogin = () => {
    setShowAuthDialog(true);
  };
  
  // Handle logout
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };
  
  // Close auth dialog
  const handleCloseAuthDialog = () => {
    setShowAuthDialog(false);
  };
  
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
            {location.startsWith("/ad-creator") && (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className={`w-6 h-6 ${currentStep >= 1 ? 'bg-[#f6242f] text-white' : 'bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB]'} rounded-full flex items-center justify-center text-xs`}>1</span>
                  <span className={`text-xs ${currentStep >= 1 ? 'font-medium text-black' : 'text-[#65676B]'}`}>Design</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" className="text-[#E4E6EB]">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M5 12h14"></path>
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M12 5l7 7-7 7"></path>
                </svg>
                <div className="flex items-center gap-1">
                  <span className={`w-6 h-6 ${currentStep >= 2 ? 'bg-[#f6242f] text-white' : 'bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB]'} rounded-full flex items-center justify-center text-xs`}>2</span>
                  <span className={`text-xs ${currentStep >= 2 ? 'font-medium text-black' : 'text-[#65676B]'}`}>Targeting</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" className="text-[#E4E6EB]">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M5 12h14"></path>
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M12 5l7 7-7 7"></path>
                </svg>
                <div className="flex items-center gap-1">
                  <span className={`w-6 h-6 ${currentStep >= 3 ? 'bg-[#f6242f] text-white' : 'bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB]'} rounded-full flex items-center justify-center text-xs`}>3</span>
                  <span className={`text-xs ${currentStep >= 3 ? 'font-medium text-black' : 'text-[#65676B]'}`}>Launch</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {/* Auth Dialog */}
              <AuthDialog 
                isOpen={showAuthDialog} 
                onClose={handleCloseAuthDialog}
                message="Sign in to access your DraperAds account"
              />
              
              {!location.startsWith("/ad-creator") && (
                <Link href="/ad-creator">
                  <button className="bg-[#f6242f] text-white px-4 py-2 rounded-md hover:opacity-90 mr-2">
                    Try It Now
                  </button>
                </Link>
              )}
              
              <Link href="/ad-history">
                <button className={`p-2 text-[#65676B] hover:bg-[#F0F2F5] rounded-full ${location === '/ad-history' ? 'bg-[#F0F2F5]' : ''}`}>
                  <Layers className="h-5 w-5" />
                </button>
              </Link>
              
              {isAuthenticated ? (
                /* User is logged in, show profile dropdown */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-8 w-8 rounded-full bg-[#f6242f] overflow-hidden flex items-center justify-center text-white border-0">
                      {user?.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt={user.firstName || 'User'} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {user?.email || 'My Account'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-500">
                      <LogOut className="h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* User is not logged in, show login button */
                <button 
                  onClick={handleLogin}
                  className="px-4 py-2 text-sm border border-[#f6242f] text-[#f6242f] rounded-md hover:bg-[#fff5f5]"
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
