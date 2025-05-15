import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const handleLogin = () => {
    // Redirect to Replit auth endpoint
    window.location.href = '/api/login';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f6242f]">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center text-xl">Create an account to publish your ad</DialogTitle>
          <DialogDescription className="text-center">
            You're almost done! Sign up or log in to publish your ad to multiple ad sets with one click.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 px-4 py-2">
          <div className="text-center text-sm text-gray-500">
            <p>Create an account to:</p>
            <ul className="mt-2 list-disc pl-5 text-left">
              <li>Save your ad creatives for future use</li>
              <li>Publish to multiple ad sets with one click</li>
              <li>Track ad performance across campaigns</li>
            </ul>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="bg-[#f6242f] hover:opacity-90 text-white" 
            onClick={handleLogin}
          >
            Sign in to continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}