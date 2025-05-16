import { AdSummary } from "./ad-summary";
import { Button } from "@/components/ui/button";

interface StepThreeProps {
  adName: string;
  onAdNameChange: (name: string) => void;
  brandName: string;
  adAccountName?: string;
  campaigns: { id: string; name: string }[];
  adSets: { id: string; name: string; campaignId?: string }[];
  facebookPage?: string;
  instagramAccount?: string;
  advantagePlusEnhancements: Record<string, boolean>;
  onBack: () => void;
  onLaunch: () => void;
  isLaunching: boolean;
}

export function StepThree({
  adName,
  onAdNameChange,
  brandName,
  adAccountName,
  campaigns,
  adSets,
  facebookPage,
  instagramAccount,
  advantagePlusEnhancements,
  onBack,
  onLaunch,
  isLaunching
}: StepThreeProps) {
  return (
    <div className="max-w-md mx-auto">
      {/* Distribution Summary component only */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <AdSummary 
          adName={adName}
          onAdNameChange={onAdNameChange}
          adAccountName={adAccountName}
          campaigns={campaigns}
          adSets={adSets}
          facebookPage={facebookPage}
          instagramAccount={instagramAccount}
          allowMultiAdvertiserAds={false}
          enableFlexibleMedia={false}
          advantagePlusEnhancements={advantagePlusEnhancements}
        />
      </div>
      
      {/* Step 3 Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        
        <Button
          onClick={onLaunch}
          disabled={isLaunching || adSets.length === 0}
          className="bg-[#f6242f] hover:opacity-90 text-white"
        >
          {isLaunching ? 
            "Launching..." : 
            `Launch to ${adSets.length} Ad Set${adSets.length !== 1 ? 's' : ''}`
          }
        </Button>
      </div>
    </div>
  );
}