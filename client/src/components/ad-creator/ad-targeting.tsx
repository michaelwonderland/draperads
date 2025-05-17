import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X, Search, Plus, Check, Facebook, Instagram } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AdAccount {
  id: number;
  accountId: string;
  name: string;
}

interface Campaign {
  id: string;
  name: string;
  status?: string; // 'ACTIVE', 'PAUSED', etc.
}

interface AdSet {
  id: string;
  name: string;
  campaignId: string;
  status?: string; // 'ACTIVE', 'PAUSED', etc.
}

interface FacebookPage {
  id: string;
  name: string;
}

interface InstagramAccount {
  id: string;
  name: string;
}

interface AdTargetingFormData {
  adAccountId: string;
  selectedCampaigns: Campaign[];
  selectedAdSets: AdSet[];
  facebookPageId: string;
  instagramAccountId: string;
  allowMultiAdvertiserAds: boolean;
  enableFlexibleMedia: boolean;
  advantagePlusEnhancements: {
    translateText: boolean;
    addOverlays: boolean;
    addCatalogItems: boolean;
    visualTouchUps: boolean;
    music: boolean;
    animation3d: boolean;
    textImprovements: boolean;
    storeLocations: boolean;
    enhanceCta: boolean;
    addSiteLinks: boolean;
    imageAnimation: boolean;
  };
}

interface AdSetConfig {
  id: string;
  name: string;
  audience: string;
}

interface AdTargetingProps {
  onChange: (data: any) => void;
  defaultValues?: Partial<AdTargetingFormData>;
  onConnectionChange?: (isConnected: boolean) => void;
  isConnected?: boolean;
  onConnectMeta?: () => void;
}

export function AdTargeting({ onChange, defaultValues, onConnectionChange, isConnected: externalIsConnected, onConnectMeta }: AdTargetingProps) {
  const [isConnected, setIsConnected] = useState(externalIsConnected || false);
  
  // Sync with external isConnected state
  useEffect(() => {
    if (externalIsConnected !== undefined && externalIsConnected !== isConnected) {
      setIsConnected(externalIsConnected);
    }
  }, [externalIsConnected]);
  
  // Pass connection state to parent component
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isConnected);
    }
  }, [isConnected, onConnectionChange]);
  
  const [searchCampaign, setSearchCampaign] = useState('');
  const [searchAdSet, setSearchAdSet] = useState('');
  
  // Account-specific data mapping
  const accountData: Record<string, {
    campaigns: Campaign[],
    adSets: AdSet[],
    facebookPages: FacebookPage[],
    instagramAccounts: InstagramAccount[]
  }> = {
    'account_1': {
      campaigns: [
        { id: 'c1_1', name: 'Summer Sale 2025', status: 'ACTIVE' },
        { id: 'c1_2', name: 'Product Launch: Eco Series', status: 'ACTIVE' },
        { id: 'c1_3', name: 'Brand Awareness Q2', status: 'PAUSED' }
      ],
      adSets: [
        { id: 'as1_1', name: 'Young Adults 18-24', campaignId: 'c1_1', status: 'ACTIVE' },
        { id: 'as1_2', name: 'Home Owners 35-45', campaignId: 'c1_1', status: 'ACTIVE' },
        { id: 'as1_3', name: 'Tech Enthusiasts', campaignId: 'c1_2', status: 'ACTIVE' },
        { id: 'as1_4', name: 'Early Adopters', campaignId: 'c1_2', status: 'PAUSED' },
        { id: 'as1_5', name: 'Broad Audience', campaignId: 'c1_3', status: 'PAUSED' }
      ],
      facebookPages: [
        { id: 'fb1_1', name: 'DraperAds Official' },
        { id: 'fb1_2', name: 'DraperAds Partners' }
      ],
      instagramAccounts: [
        { id: 'ig1_1', name: 'draperads' },
        { id: 'ig1_2', name: 'draper.creative' }
      ]
    },
    'account_2': {
      campaigns: [
        { id: 'c2_1', name: 'Winter Holiday Special', status: 'PAUSED' },
        { id: 'c2_2', name: 'Lead Generation - Enterprise', status: 'ACTIVE' },
        { id: 'c2_3', name: 'Social Media Contest', status: 'ACTIVE' }
      ],
      adSets: [
        { id: 'as2_1', name: 'Holiday Shoppers', campaignId: 'c2_1', status: 'PAUSED' },
        { id: 'as2_2', name: 'Gift Givers 25-45', campaignId: 'c2_1', status: 'PAUSED' },
        { id: 'as2_3', name: 'Business Decision Makers', campaignId: 'c2_2', status: 'ACTIVE' },
        { id: 'as2_4', name: 'Social Contest Entrants', campaignId: 'c2_3', status: 'ACTIVE' }
      ],
      facebookPages: [
        { id: 'fb2_1', name: 'Creative Solutions' }
      ],
      instagramAccounts: [
        { id: 'ig2_1', name: 'creativesolutions' }
      ]
    }
  };

  const { data: adAccounts, isLoading: isLoadingAccounts } = useQuery<AdAccount[]>({
    queryKey: ["/api/ad-accounts"],
  });

  const [formData, setFormData] = useState<AdTargetingFormData>({
    adAccountId: defaultValues?.adAccountId || "",
    selectedCampaigns: defaultValues?.selectedCampaigns || [],
    selectedAdSets: defaultValues?.selectedAdSets || [],
    facebookPageId: defaultValues?.facebookPageId || "",
    instagramAccountId: defaultValues?.instagramAccountId || "",
    allowMultiAdvertiserAds: defaultValues?.allowMultiAdvertiserAds !== undefined ? defaultValues.allowMultiAdvertiserAds : true,
    enableFlexibleMedia: defaultValues?.enableFlexibleMedia || false,
    advantagePlusEnhancements: defaultValues?.advantagePlusEnhancements || {
      translateText: false,
      addOverlays: false,
      addCatalogItems: false,
      visualTouchUps: false,
      music: false,
      animation3d: false,
      textImprovements: false,
      storeLocations: false,
      enhanceCta: false,
      addSiteLinks: false,
      imageAnimation: false,
    }
  });
  
  // For conversion to old format
  const convertToOldFormat = (data: AdTargetingFormData) => {
    // Get the actual Facebook page and Instagram account names
    let facebookPageName = "";
    let instagramAccountName = "";
    
    if (data.facebookPageId && data.adAccountId) {
      const fbPage = accountData[data.adAccountId]?.facebookPages.find(
        page => page.id === data.facebookPageId
      );
      facebookPageName = fbPage?.name || "";
    }
    
    if (data.instagramAccountId && data.adAccountId) {
      const igAccount = accountData[data.adAccountId]?.instagramAccounts.find(
        account => account.id === data.instagramAccountId
      );
      instagramAccountName = igAccount?.name || "";
    }
    
    // Get more detailed mapping of ad sets with their campaign relationships
    const enhancedAdSets = data.selectedAdSets.map(adSet => {
      // Find the complete ad set data from the source
      const adSetDetails = data.adAccountId ?
        accountData[data.adAccountId]?.adSets.find(a => a.id === adSet.id) : null;
      
      return {
        id: adSet.id,
        name: adSet.name,
        campaignId: adSetDetails?.campaignId || "", // Important to include campaign relationship
        audience: "Broad - 25-54 age range", // default audience
        status: adSetDetails?.status || "ACTIVE" // Include status too
      };
    });
    
    return {
      adAccountId: data.adAccountId,
      campaignObjective: "traffic", // default
      placements: ["facebook", "instagram"], // default
      adSets: enhancedAdSets,
      facebookPageId: data.facebookPageId,
      instagramAccountId: data.instagramAccountId,
      facebookPageName,
      instagramAccountName,
      // Include advantage plus enhancements for better persistence
      allowMultiAdvertiserAds: data.allowMultiAdvertiserAds,
      enableFlexibleMedia: data.enableFlexibleMedia,
      advantagePlusEnhancements: data.advantagePlusEnhancements
    };
  };

  // Use a ref to debounce changes
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sync changes to parent component with memoized data to avoid infinite renders
  useEffect(() => {
    // Cancel previous timeout
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }
    
    // Add a small debounce to avoid too many calls
    changeTimeoutRef.current = setTimeout(() => {
      const oldFormatData = convertToOldFormat(formData);
      onChange(oldFormatData);
      
      // Log what's being sent to parent for debugging
      console.log("Sending updated targeting data to parent:", oldFormatData);
      changeTimeoutRef.current = null;
    }, 300);
    
    // Cleanup on unmount
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, [
    formData.adAccountId, 
    // Track the full array contents not just length
    JSON.stringify(formData.selectedCampaigns), 
    JSON.stringify(formData.selectedAdSets), 
    formData.facebookPageId,
    formData.instagramAccountId,
    formData.allowMultiAdvertiserAds,
    formData.enableFlexibleMedia,
    JSON.stringify(formData.advantagePlusEnhancements),
    onChange
  ]);

  // Reset selections when account changes
  const handleAccountChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      adAccountId: value,
      selectedCampaigns: [],
      selectedAdSets: [],
      facebookPageId: "",
      instagramAccountId: ""
    }));
  };

  const handleConnectMeta = () => {
    setIsConnected(true);
    // Just connect without making any default selections
    // User will need to select an account first
    setFormData(prev => ({ 
      ...prev, 
      adAccountId: "",
      selectedCampaigns: [],
      selectedAdSets: [],
      facebookPageId: "",
      instagramAccountId: ""
    }));
  };

  const handleToggleCampaign = (campaign: Campaign) => {
    setFormData(prev => {
      const isCampaignSelected = prev.selectedCampaigns.some(c => c.id === campaign.id);
      
      // Remove or add the campaign
      const updatedCampaigns = isCampaignSelected
        ? prev.selectedCampaigns.filter(c => c.id !== campaign.id)
        : [...prev.selectedCampaigns, campaign];
      
      // If removing a campaign, also remove its ad sets
      const updatedAdSets = isCampaignSelected
        ? prev.selectedAdSets.filter(adSet => {
            // Get available adSets for this account
            const accountAdSets = accountData[prev.adAccountId]?.adSets || [];
            const matchingAdSet = accountAdSets.find(a => a.id === adSet.id);
            return matchingAdSet && matchingAdSet.campaignId !== campaign.id;
          })
        : prev.selectedAdSets;
      
      return {
        ...prev,
        selectedCampaigns: updatedCampaigns,
        selectedAdSets: updatedAdSets
      };
    });
  };

  const handleToggleAdSet = (adSet: AdSet) => {
    setFormData(prev => {
      const isAdSetSelected = prev.selectedAdSets.some(a => a.id === adSet.id);
      
      const updatedAdSets = isAdSetSelected
        ? prev.selectedAdSets.filter(a => a.id !== adSet.id)
        : [...prev.selectedAdSets, adSet];
      
      return {
        ...prev,
        selectedAdSets: updatedAdSets
      };
    });
  };

  const handleRemoveCampaign = (campaignId: string) => {
    setFormData(prev => {
      // Remove the campaign
      const updatedCampaigns = prev.selectedCampaigns.filter(c => c.id !== campaignId);
      
      // Remove its ad sets
      const updatedAdSets = prev.selectedAdSets.filter(adSet => {
        // Get available adSets for this account
        const accountAdSets = accountData[prev.adAccountId]?.adSets || [];
        const matchingAdSet = accountAdSets.find(a => a.id === adSet.id);
        return matchingAdSet && matchingAdSet.campaignId !== campaignId;
      });
      
      return {
        ...prev,
        selectedCampaigns: updatedCampaigns,
        selectedAdSets: updatedAdSets
      };
    });
  };

  const handleRemoveAdSet = (adSetId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAdSets: prev.selectedAdSets.filter(a => a.id !== adSetId)
    }));
  };

  const handleFacebookPageChange = (value: string) => {
    setFormData(prev => ({ ...prev, facebookPageId: value }));
  };

  const handleInstagramAccountChange = (value: string) => {
    setFormData(prev => ({ ...prev, instagramAccountId: value }));
  };

  const handleToggleEnhancement = (key: keyof AdTargetingFormData['advantagePlusEnhancements']) => {
    setFormData(prev => ({
      ...prev,
      advantagePlusEnhancements: {
        ...prev.advantagePlusEnhancements,
        [key]: !prev.advantagePlusEnhancements[key]
      }
    }));
  };

  // Get campaign and ad set data based on the selected account
  const getAccountCampaigns = () => {
    if (!formData.adAccountId || !isConnected) return [];
    return accountData[formData.adAccountId]?.campaigns || [];
  };
  
  // Filter and sort campaigns (active first, then paused)
  const getFilteredCampaigns = () => {
    const campaigns = getAccountCampaigns();
    
    // Filter by search text
    const filteredCampaigns = campaigns.filter(campaign => 
      campaign.name.toLowerCase().includes(searchCampaign.toLowerCase())
    );
    
    // Sort: Active first, then alphabetically
    return filteredCampaigns.sort((a, b) => {
      // First sort by status (Active first)
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
      
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });
  };
  
  const getAccountAdSets = () => {
    if (!formData.adAccountId || !isConnected) return [];
    
    // Filter ad sets to only include those from selected campaigns
    if (formData.selectedCampaigns.length > 0) {
      const campaignIds = formData.selectedCampaigns.map(c => c.id);
      return accountData[formData.adAccountId]?.adSets.filter(adSet => 
        campaignIds.includes(adSet.campaignId)
      ) || [];
    }
    
    // Otherwise return all ad sets for the account
    return accountData[formData.adAccountId]?.adSets || [];
  };
  
  // Filter and sort ad sets by status, campaign, and alphabetical order
  const getFilteredAdSets = () => {
    // Filter by search text
    const filteredAdSets = getAccountAdSets().filter(adSet => 
      adSet.name.toLowerCase().includes(searchAdSet.toLowerCase())
    );
    
    // Sort: 1. Active ad sets first, 2. Group by campaign, 3. Alphabetical
    return filteredAdSets.sort((a, b) => {
      // Get campaigns for each ad set
      const campaignA = accountData[formData.adAccountId]?.campaigns.find(c => c.id === a.campaignId);
      const campaignB = accountData[formData.adAccountId]?.campaigns.find(c => c.id === b.campaignId);
      
      // 1. Sort by ad set status first (active first)
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
      
      // 2. If same status, sort by campaign status
      if (campaignA?.status === 'ACTIVE' && campaignB?.status !== 'ACTIVE') return -1;
      if (campaignA?.status !== 'ACTIVE' && campaignB?.status === 'ACTIVE') return 1;
      
      // 2. Sort by campaign
      if (a.campaignId !== b.campaignId) {
        return campaignA?.name.localeCompare(campaignB?.name || '') || 0;
      }
      
      // 3. Sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  };
  
  const getAccountFacebookPages = () => {
    if (!formData.adAccountId || !isConnected) return [];
    return accountData[formData.adAccountId]?.facebookPages || [];
  };
  
  const getAccountInstagramAccounts = () => {
    if (!formData.adAccountId || !isConnected) return [];
    return accountData[formData.adAccountId]?.instagramAccounts || [];
  };

  const getActiveEnhancementsCount = () => {
    return Object.values(formData.advantagePlusEnhancements).filter(Boolean).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Distribution Settings</h2>
      <p className="text-sm text-[#65676B] mb-6">
        Choose where to deploy the ad you just created.
      </p>
      
      <div className="space-y-6">
        {/* Meta Connection Banner - Always show but change state */}
        {!isConnected ? (
          <div className="flex items-center gap-3 bg-[#F7F8FA] p-4 border border-dashed border-[#E4E6EB] rounded-lg">
            <div className="flex-1">
              <h3 className="text-base font-medium">Connect Your Meta Account</h3>
              <p className="text-sm text-[#65676B]">
                Ad Account, Campaign and Ad Set options will appear after connecting
              </p>
            </div>
            <Button 
              onClick={handleConnectMeta}
              className="bg-[#1877F2] hover:bg-[#0b5fcc] text-white"
            >
              Connect to Meta
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-[#F7F8FA] p-3 rounded-md">
            <div className="bg-[#1877F2] text-white rounded-full p-1.5">
              <Check className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Connected to Meta Business Manager</p>
              <p className="text-xs text-[#65676B]">Your ad will be distributed through the selected campaigns and ad sets</p>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              className="text-[#65676B]"
              onClick={() => setIsConnected(false)}
            >
              Disconnect
            </Button>
          </div>
        )}

        <div>
          <Label htmlFor="ad_account" className="text-sm font-medium mb-1">Ad Account</Label>
          <Select
            onValueChange={handleAccountChange}
            value={formData.adAccountId}
            disabled={!isConnected}
          >
            <SelectTrigger id="ad_account" className={`w-full ${!isConnected ? 'bg-gray-50 text-gray-400' : ''}`}>
              <SelectValue placeholder={isConnected ? "Select Account" : "Connect to view ad accounts"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="account_1">DraperAds Marketing (ID: 1078354229)</SelectItem>
              <SelectItem value="account_2">Creative Solutions (ID: 897216453)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campaign Multi-Selector */}
        <div>
          <Label className="text-sm font-medium mb-1">Campaigns</Label>
          <div className="relative">
            <div
              className={`border rounded-md p-2 flex flex-col ${!isConnected || !formData.adAccountId ? 'bg-gray-50 pointer-events-none opacity-60' : ''}`}
            >
              {/* Search box */}
              <div className="mb-2 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={isConnected && formData.adAccountId 
                    ? "Search campaigns..." 
                    : "Connect Meta and select account first"}
                  className="pl-8 bg-white"
                  value={searchCampaign}
                  onChange={(e) => setSearchCampaign(e.target.value)}
                  disabled={!isConnected || !formData.adAccountId}
                />
              </div>
              
              {/* Select All */}
              {isConnected && formData.adAccountId && getFilteredCampaigns().length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center px-1">
                    <Checkbox 
                      id="select-all-campaigns"
                      checked={
                        getFilteredCampaigns().length > 0 &&
                        getFilteredCampaigns().every(campaign => 
                          formData.selectedCampaigns.some(c => c.id === campaign.id)
                        )
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          // Select all filtered campaigns
                          const filteredCampaignIds = getFilteredCampaigns().map(c => c.id);
                          const currentSelected = [...formData.selectedCampaigns];
                          
                          // Add any filtered campaigns not already selected
                          getFilteredCampaigns().forEach(campaign => {
                            if (!currentSelected.some(c => c.id === campaign.id)) {
                              currentSelected.push(campaign);
                            }
                          });
                          
                          setFormData(prev => ({
                            ...prev,
                            selectedCampaigns: currentSelected,
                            // Clear ad sets as campaigns selection changes
                            selectedAdSets: []
                          }));
                        } else {
                          // Deselect all filtered campaigns
                          const filteredCampaignIds = getFilteredCampaigns().map(c => c.id);
                          
                          setFormData(prev => ({
                            ...prev,
                            selectedCampaigns: prev.selectedCampaigns.filter(
                              campaign => !filteredCampaignIds.includes(campaign.id)
                            ),
                            // Clear ad sets as campaigns selection changes
                            selectedAdSets: []
                          }));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-[#f6242f]"
                    />
                    <Label htmlFor="select-all-campaigns" className="ml-2 text-sm font-medium">
                      Select All {searchCampaign ? "Matching" : ""} ({getFilteredCampaigns().length})
                    </Label>
                  </div>
                </div>
              )}
              
              {isConnected && formData.adAccountId && getFilteredCampaigns().length > 0 && (
                <Separator className="mb-2" />
              )}
              
              {/* Campaign list */}
              <ScrollArea className="h-48 w-full pr-4">
                {getFilteredCampaigns().length > 0 ? (
                  <div className="space-y-1">
                    {getFilteredCampaigns().map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer"
                        onClick={() => handleToggleCampaign(campaign)}
                      >
                        <Checkbox
                          checked={formData.selectedCampaigns.some(c => c.id === campaign.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#f6242f]"
                          onCheckedChange={() => handleToggleCampaign(campaign)}
                        />
                        <div>
                          <span className="text-sm">{campaign.name}</span>
                          {campaign.status && (
                            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                              campaign.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {campaign.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    {searchCampaign
                      ? "No matching campaigns found" 
                      : !isConnected || !formData.adAccountId
                        ? "Connect to Meta and select an account" 
                        : "No campaigns available"}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* Selected campaign badges */}
            {formData.selectedCampaigns.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.selectedCampaigns.map(campaign => (
                  <Badge key={campaign.id} variant="secondary" className="bg-[#f1f1f1] text-black">
                    {campaign.name}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleRemoveCampaign(campaign.id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ad Set Multi-Selector */}
        <div>
          <Label className="text-sm font-medium mb-1">Ad Sets</Label>
          <div className="relative">
            <div
              className={`border rounded-md p-2 flex flex-col ${!isConnected || !formData.adAccountId || formData.selectedCampaigns.length === 0 ? 'bg-gray-50 pointer-events-none opacity-60' : ''}`}
            >
              {/* Search box */}
              <div className="mb-2 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={isConnected && formData.adAccountId
                    ? formData.selectedCampaigns.length > 0
                      ? "Search ad sets..."
                      : "Select campaigns first"
                    : "Connect Meta and select account first"}
                  className="pl-8 bg-white"
                  value={searchAdSet}
                  onChange={(e) => setSearchAdSet(e.target.value)}
                  disabled={!isConnected || !formData.adAccountId || formData.selectedCampaigns.length === 0}
                />
              </div>
              
              {/* Select All */}
              {isConnected && formData.adAccountId && formData.selectedCampaigns.length > 0 && getFilteredAdSets().length > 0 && (
                <div className="flex items-center mb-2 px-1">
                  <Checkbox 
                    id="select-all-adsets"
                    checked={
                      getFilteredAdSets().length > 0 &&
                      getFilteredAdSets().every(adSet => 
                        formData.selectedAdSets.some(a => a.id === adSet.id)
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // Select all filtered ad sets
                        const currentSelected = [...formData.selectedAdSets];
                        
                        // Add any filtered ad sets not already selected
                        getFilteredAdSets().forEach(adSet => {
                          if (!currentSelected.some(a => a.id === adSet.id)) {
                            currentSelected.push(adSet);
                          }
                        });
                        
                        setFormData(prev => ({
                          ...prev,
                          selectedAdSets: currentSelected
                        }));
                      } else {
                        // Deselect all filtered ad sets
                        const filteredAdSetIds = getFilteredAdSets().map(a => a.id);
                        
                        setFormData(prev => ({
                          ...prev,
                          selectedAdSets: prev.selectedAdSets.filter(
                            adSet => !filteredAdSetIds.includes(adSet.id)
                          )
                        }));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-[#f6242f]"
                  />
                  <Label htmlFor="select-all-adsets" className="ml-2 text-sm font-medium">
                    Select All {searchAdSet ? "Matching" : ""} ({getFilteredAdSets().length})
                  </Label>
                </div>
              )}
                
              {/* Separator */}
              {isConnected && formData.adAccountId && formData.selectedCampaigns.length > 0 && getFilteredAdSets().length > 0 && (
                <Separator className="mb-2" />
              )}
              
              {/* Ad Set list */}
              <ScrollArea className="h-48 w-full pr-4">
                {getFilteredAdSets().length > 0 ? (
                  <div className="space-y-1">
                    {getFilteredAdSets().map((adSet) => (
                      <div
                        key={adSet.id}
                        className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer"
                        onClick={() => handleToggleAdSet(adSet)}
                      >
                        <Checkbox
                          checked={formData.selectedAdSets.some(a => a.id === adSet.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#f6242f]"
                          onCheckedChange={() => handleToggleAdSet(adSet)}
                        />
                        <div className="flex-1">
                          <div className="text-sm">
                            {adSet.name}
                            {adSet.status && (
                              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                                adSet.status === 'ACTIVE' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {adSet.status}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#65676B]">
                            {
                              // Find the campaign for this ad set in the account data
                              accountData[formData.adAccountId]?.campaigns.find(c => c.id === adSet.campaignId)?.name
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    {!isConnected || !formData.adAccountId 
                      ? "Please connect to Meta and select an account" 
                      : formData.selectedCampaigns.length === 0
                        ? "Please select campaigns first"
                        : searchAdSet
                          ? "No matching ad sets found"
                          : "No ad sets found for selected campaigns"}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* Selected ad sets badges */}
            {formData.selectedAdSets.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.selectedAdSets.map(adSet => (
                  <Badge key={adSet.id} variant="secondary" className="bg-[#f1f1f1] text-black">
                    {adSet.name}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleRemoveAdSet(adSet.id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Brand Identity Section */}
        <div>
          <h3 className="text-base font-medium mb-4">Brand Identity</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Facebook className="h-5 w-5 mr-2 text-[#1877F2]" />
              <div className="flex-1">
                <Label htmlFor="fb_page" className="text-sm font-medium">Facebook Page</Label>
                <Select
                  onValueChange={handleFacebookPageChange}
                  value={formData.facebookPageId}
                  disabled={!isConnected || !formData.adAccountId}
                >
                  <SelectTrigger id="fb_page" className={`w-full mt-1 ${!isConnected || !formData.adAccountId ? 'bg-gray-50 text-gray-400' : ''}`}>
                    <SelectValue placeholder="Select Facebook Page" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAccountFacebookPages().map(page => (
                      <SelectItem key={page.id} value={page.id}>{page.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center">
              <Instagram className="h-5 w-5 mr-2 text-[#E1306C]" />
              <div className="flex-1">
                <Label htmlFor="ig_account" className="text-sm font-medium">Instagram Account</Label>
                <Select
                  onValueChange={handleInstagramAccountChange}
                  value={formData.instagramAccountId}
                  disabled={!isConnected || !formData.adAccountId}
                >
                  <SelectTrigger id="ig_account" className={`w-full mt-1 ${!isConnected || !formData.adAccountId ? 'bg-gray-50 text-gray-400' : ''}`}>
                    <SelectValue placeholder="Select Instagram Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAccountInstagramAccounts().map(account => (
                      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="multi-advertiser" className="text-sm font-medium">Allow Multi-Advertiser Ads</Label>
              <p className="text-xs text-[#65676B]">Let Meta show your ads alongside other advertisers</p>
            </div>
            <Switch 
              id="multi-advertiser"
              checked={formData.allowMultiAdvertiserAds}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowMultiAdvertiserAds: checked }))}
              className="data-[state=checked]:bg-[#f6242f]"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="flexible-media" className="text-sm font-medium">Enable Flexible Media</Label>
              <p className="text-xs text-[#65676B]">Allows Meta to adjust your media to fit different placements</p>
            </div>
            <Switch 
              id="flexible-media"
              checked={formData.enableFlexibleMedia}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableFlexibleMedia: checked }))}
              className="data-[state=checked]:bg-[#f6242f]"
            />
          </div>
        </div>
        
        {/* Advantage+ Settings */}
        <div>
          <Accordion type="single" collapsible className="w-full border rounded-md overflow-hidden">
            <AccordionItem value="advantage-plus" className="border-none">
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-base font-medium">Advantage+ Creative Enhancements</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
                    <span>{getActiveEnhancementsCount()} out of 11</span>
                    {getActiveEnhancementsCount() > 0 && (
                      <Badge className="bg-[#f6242f] text-white">{getActiveEnhancementsCount()}</Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 py-0 pb-0">
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="translate-text"
                      checked={formData.advantagePlusEnhancements.translateText}
                      onCheckedChange={() => handleToggleEnhancement('translateText')}
                      className="rounded text-[#f6242f]"
                    />
                    <Label htmlFor="translate-text" className="cursor-pointer text-sm">Translate text</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="add-overlays"
                      checked={formData.advantagePlusEnhancements.addOverlays}
                      onCheckedChange={() => handleToggleEnhancement('addOverlays')}
                      className="rounded text-[#f6242f]"
                    />
                    <Label htmlFor="add-overlays" className="cursor-pointer text-sm">Add overlays</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="add-catalog-items"
                      checked={formData.advantagePlusEnhancements.addCatalogItems}
                      onCheckedChange={() => handleToggleEnhancement('addCatalogItems')}
                      className="rounded text-[#f6242f]"
                    />
                    <Label htmlFor="add-catalog-items" className="cursor-pointer text-sm">Add catalog items</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="visual-touch-ups"
                      checked={formData.advantagePlusEnhancements.visualTouchUps}
                      onCheckedChange={() => handleToggleEnhancement('visualTouchUps')}
                      className="rounded text-[#f6242f]"
                    />
                    <Label htmlFor="visual-touch-ups" className="cursor-pointer text-sm">Visual touch-ups</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="music"
                      checked={formData.advantagePlusEnhancements.music}
                      onCheckedChange={() => handleToggleEnhancement('music')}
                      className="rounded text-[#f6242f]"
                    />
                    <Label htmlFor="music" className="cursor-pointer text-sm">Add music</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="animation-3d"
                      checked={formData.advantagePlusEnhancements.animation3d}
                      onCheckedChange={() => handleToggleEnhancement('animation3d')}
                      className="rounded text-[#f6242f]"
                    />
                    <Label htmlFor="animation-3d" className="cursor-pointer text-sm">3D animation</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="text-improvements"
                      checked={formData.advantagePlusEnhancements.textImprovements}
                      onCheckedChange={() => handleToggleEnhancement('textImprovements')}
                      className="rounded text-[#f6242f]"
                    />
                    <Label htmlFor="text-improvements" className="cursor-pointer text-sm">Text improvements</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="store-locations"
                      checked={formData.advantagePlusEnhancements.storeLocations}
                      onCheckedChange={() => handleToggleEnhancement('storeLocations')}
                      className="rounded text-[#f6242f]"
                    />
                    <Label htmlFor="store-locations" className="cursor-pointer text-sm">Add store locations</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="enhance-cta"
                      checked={formData.advantagePlusEnhancements.enhanceCta}
                      onCheckedChange={() => handleToggleEnhancement('enhanceCta')}
                      className="rounded text-[#f6242f]"
                    />
                    <Label htmlFor="enhance-cta" className="cursor-pointer text-sm">Enhance CTA</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="add-site-links"
                      checked={formData.advantagePlusEnhancements.addSiteLinks}
                      onCheckedChange={() => handleToggleEnhancement('addSiteLinks')}
                      className="rounded text-[#f6242f]"
                    />
                    <Label htmlFor="add-site-links" className="cursor-pointer text-sm">Add site links</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="image-animation"
                      checked={formData.advantagePlusEnhancements.imageAnimation}
                      onCheckedChange={() => handleToggleEnhancement('imageAnimation')}
                      className="rounded text-[#f6242f]"
                    />
                    <Label htmlFor="image-animation" className="cursor-pointer text-sm">Image animation</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}