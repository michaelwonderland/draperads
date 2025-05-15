import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  message?: string;
}

export function AuthDialog({
  isOpen,
  onClose,
  onLoginSuccess,
  message = "You need to be logged in to publish ads"
}: AuthDialogProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  // If user is authenticated, close the dialog and call onLoginSuccess
  if (isAuthenticated && isOpen) {
    onClose();
    onLoginSuccess?.();
    return null;
  }

  // Handle login button click
  const handleLogin = () => {
    setIsLoggingIn(true);
    // Redirect to login API endpoint
    window.location.href = "/api/login";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#f6242f] to-black bg-clip-text text-transparent">
            Join DraperAds
          </DialogTitle>
          <DialogDescription className="pt-4 text-lg">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <Button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-[#f6242f] hover:bg-[#e11e29] text-white"
            >
              {isLoggingIn ? "Redirecting..." : "Log in with Replit"}
            </Button>
            <div className="text-center text-sm text-gray-500">
              By logging in, you agree to our{" "}
              <a href="#" className="underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="border-t w-full"></div>
          </div>
          <div className="text-center text-sm">
            <p>
              DraperAds - The way it should have always been, really.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}