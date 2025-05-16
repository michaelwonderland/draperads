import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AdSummaryProps {
  adName?: string;
  onAdNameChange: (name: string) => void;
  adAccountName?: string;
  campaigns: { 
    id: string;
    name: string;
  }[];
  adSets: { 
    id: string;
    name: string;
    campaignId?: string;
  }[];
  facebookPage?: string;
  instagramAccount?: string;
  allowMultiAdvertiserAds?: boolean;
  enableFlexibleMedia?: boolean;
  advantagePlusEnhancements?: {
    translateText?: boolean;
    addOverlays?: boolean;
    addCatalogItems?: boolean;
    visualTouchUps?: boolean;
    music?: boolean;
    animation3d?: boolean;
    textImprovements?: boolean;
    storeLocations?: boolean;
    enhanceCta?: boolean;
    addSiteLinks?: boolean;
    imageAnimation?: boolean;
  };
}

export function AdSummary({
  adName = "Untitled Ad",
  onAdNameChange,
  adAccountName,
  campaigns = [],
  adSets = [],
  facebookPage,
  instagramAccount,
  allowMultiAdvertiserAds = false,
  enableFlexibleMedia = false,
  advantagePlusEnhancements = {}
}: AdSummaryProps) {
  const [localAdName, setLocalAdName] = useState(adName);
  
  // Handle local ad name change
  const handleAdNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAdName(e.target.value);
    onAdNameChange(e.target.value);
  };
  
  // Count enabled enhancements
  const enabledEnhancementsCount = Object.values(advantagePlusEnhancements).filter(value => value).length;
  const totalEnhancementsCount = 11; // Total number of possible enhancements
  
  // Get list of enabled enhancement names
  const getEnabledEnhancements = () => {
    const enhancementLabels: Record<string, string> = {
      translateText: "Translate Text",
      addOverlays: "Add Overlays",
      addCatalogItems: "Add Catalog Items",
      visualTouchUps: "Visual Touch-ups",
      music: "Music",
      animation3d: "3D Animation",
      textImprovements: "Text Improvements",
      storeLocations: "Store Locations",
      enhanceCta: "Enhance CTA",
      addSiteLinks: "Add Site Links",
      imageAnimation: "Image Animation"
    };
    
    return Object.entries(advantagePlusEnhancements)
      .filter(([_, isEnabled]) => isEnabled)
      .map(([key]) => enhancementLabels[key]);
  };
  
  const enabledEnhancements = getEnabledEnhancements();
  
  return (
    <div className="space-y-6">
      {/* Ad Name Input */}
      <div className="bg-gray-100 p-4 rounded-md">
        <label htmlFor="adName" className="block text-sm font-medium text-gray-700 mb-1">
          Ad Name
        </label>
        <Input
          id="adName"
          value={localAdName}
          onChange={handleAdNameChange}
          className="bg-white border-gray-300"
          placeholder="Enter ad name"
        />
      </div>
      
      {/* Distribution Summary */}
      <div>
        <h3 className="font-medium mb-3">Distribution Settings</h3>
        
        {adAccountName && (
          <div className="mb-3">
            <div className="text-sm text-gray-500 mb-1">Ad Account</div>
            <div className="text-sm">{adAccountName}</div>
          </div>
        )}
        
        {/* Campaigns */}
        <div className="mb-3">
          <div className="text-sm text-gray-500 mb-1">Campaigns ({campaigns.length})</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {campaigns.map(campaign => (
              <Badge key={campaign.id} variant="outline" className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs">
                {campaign.name}
                <X className="ml-1 h-3 w-3 text-gray-500" />
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Ad Sets */}
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Ad Sets ({adSets.length})</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {adSets.map(adSet => (
              <Badge key={adSet.id} variant="outline" className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs">
                {adSet.name}
                <X className="ml-1 h-3 w-3 text-gray-500" />
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Brand Identity */}
        {(facebookPage || instagramAccount) && (
          <div className="mb-3">
            <div className="text-sm text-gray-500 mb-1">Brand Identity</div>
            {facebookPage && (
              <div className="text-sm mb-1">
                <span className="text-gray-500 mr-2">Facebook Page:</span>
                {facebookPage}
              </div>
            )}
            {instagramAccount && (
              <div className="text-sm">
                <span className="text-gray-500 mr-2">Instagram Account:</span>
                {instagramAccount}
              </div>
            )}
          </div>
        )}
        
        {/* Feature Settings */}
        <div className="mb-3">
          <div className="text-sm text-gray-500 mb-1">Feature Settings</div>
          <div className="text-sm mb-1">
            <span className="text-gray-500 mr-2">Allow Multi-Advertiser Ads:</span>
            {allowMultiAdvertiserAds ? "On" : "Off"}
          </div>
          <div className="text-sm">
            <span className="text-gray-500 mr-2">Enable Flexible Media:</span>
            {enableFlexibleMedia ? "On" : "Off"}
          </div>
        </div>
        
        {/* Advantage+ Enhancements */}
        <div>
          <div className="text-sm text-gray-500 mb-1">
            Advantage+ Creative Enhancements ({enabledEnhancementsCount} of {totalEnhancementsCount})
          </div>
          {enabledEnhancementsCount > 0 ? (
            <div className="text-sm">
              {enabledEnhancements.join(", ")}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No enhancements enabled</div>
          )}
        </div>
      </div>
    </div>
  );
}