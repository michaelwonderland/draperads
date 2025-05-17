import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MetaAuthButton } from "./meta-auth-button";
import { useState } from "react";
import { Facebook } from "lucide-react";

interface MetaAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthComplete?: () => void;
}

export function MetaAuthDialog({ 
  open, 
  onOpenChange,
  onAuthComplete 
}: MetaAuthDialogProps) {
  const [isConnected, setIsConnected] = useState(false);

  const handleAuthStatusChange = (status: boolean) => {
    setIsConnected(status);
    if (status && onAuthComplete) {
      // Wait a moment before closing to show the success state
      setTimeout(() => {
        onAuthComplete();
        onOpenChange(false);
      }, 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to Meta Ads</DialogTitle>
          <DialogDescription>
            Connect your Meta Business account to launch ads directly from DraperAds.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-6">
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="font-medium flex items-center">
              <Facebook className="w-5 h-5 mr-2 text-[#1877F2]" />
              Meta Business Account
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Requires an active Business Manager account with ad accounts and permissions.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <h4 className="font-medium">What you'll get:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Access to your Meta Ad accounts</li>
              <li>• Ability to publish ads directly to Meta</li>
              <li>• Connect your Facebook pages and Instagram accounts</li>
              <li>• View campaigns, ad sets, and targeting options</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <MetaAuthButton 
            onAuthStatusChange={handleAuthStatusChange}
            className="w-full sm:w-auto"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}