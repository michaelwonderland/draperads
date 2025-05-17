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
  isMetaConnected?: boolean;
  onConnectMeta?: () => void;
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
  isMetaConnected = false,
  onConnectMeta,
  advantagePlusEnhancements = {}
}: AdSummaryProps) {
  const [localAdName, setLocalAdName] = useState(adName);
  
  // Handle local ad name change
  const handleAdNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAdName(e.target.value);
    onAdNameChange(e.target.value);
  };
  
  // Count enabled enhancements
  const enabledEnhancementsCount = Object.values(advantagePlusEnhancements || {}).filter(value => value).length;
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
    
    return Object.entries(advantagePlusEnhancements || {})
      .filter(([_, isEnabled]) => isEnabled)
      .map(([key]) => enhancementLabels[key as keyof typeof enhancementLabels]);
  };
  
  const enabledEnhancements = getEnabledEnhancements();
  
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-medium mb-2">Distribution Summary</h3>
      
      {/* Ad Name Input */}
      <div className="mb-4">
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
        {/* Meta Connection Status */}
        <div className="mb-3 pb-3 border-b border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Meta Connection</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isMetaConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{isMetaConnected ? 'Connected to Meta' : 'Not connected to Meta'}</span>
            </div>
            {!isMetaConnected && onConnectMeta && (
              <button 
                onClick={onConnectMeta}
                className="text-sm bg-[#1877F2] text-white px-3 py-1.5 rounded-md hover:bg-[#1877F2]/90 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Connect
              </button>
            )}
          </div>
        </div>
        
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
              <Badge 
                key={campaign.id} 
                variant="outline" 
                className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs flex items-center"
              >
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
              <Badge 
                key={adSet.id} 
                variant="outline" 
                className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs flex items-center"
              >
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