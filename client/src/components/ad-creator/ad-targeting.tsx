import { useState, useEffect } from "react";
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
}

interface AdSet {
  id: string;
  name: string;
  campaignId: string;
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
}

export function AdTargeting({ onChange, defaultValues }: AdTargetingProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [searchCampaign, setSearchCampaign] = useState('');
  const [searchAdSet, setSearchAdSet] = useState('');
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [showAdSetDropdown, setShowAdSetDropdown] = useState(false);

  // Mock data for the display
  const mockCampaigns: Campaign[] = [
    { id: 'c1', name: 'Summer Sale 2025' },
    { id: 'c2', name: 'Product Launch: Eco Series' },
    { id: 'c3', name: 'Brand Awareness Q2' },
    { id: 'c4', name: 'Winter Holiday Special' },
    { id: 'c5', name: 'Lead Generation - Enterprise' },
    { id: 'c6', name: 'Social Media Contest' },
  ];

  const mockAdSets: AdSet[] = [
    { id: 'as1', name: 'US - Mobile Users', campaignId: 'c1' },
    { id: 'as2', name: 'EU - Desktop Users', campaignId: 'c1' },
    { id: 'as3', name: 'APAC Region', campaignId: 'c2' },
    { id: 'as4', name: 'Gen Z - 18-25', campaignId: 'c2' },
    { id: 'as5', name: 'Business Decision Makers', campaignId: 'c3' },
    { id: 'as6', name: 'Previous Customers', campaignId: 'c4' },
    { id: 'as7', name: 'Website Visitors - Last 30 Days', campaignId: 'c5' },
    { id: 'as8', name: 'Social Media Engagers', campaignId: 'c6' },
  ];

  const mockFacebookPages: FacebookPage[] = [
    { id: 'fb1', name: 'DraperAds Business' },
    { id: 'fb2', name: 'Creative Marketing Solutions' },
  ];

  const mockInstagramAccounts: InstagramAccount[] = [
    { id: 'ig1', name: '@draperadsbiz' },
    { id: 'ig2', name: '@creativemarketingsolutions' },
  ];

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
    return {
      adAccountId: data.adAccountId,
      campaignObjective: "traffic", // default
      placements: ["facebook", "instagram"], // default
      adSets: data.selectedAdSets.map(adSet => ({
        id: adSet.id,
        name: adSet.name,
        audience: "Broad - 25-54 age range" // default audience
      }))
    };
  };

  // Sync changes to parent component
  useEffect(() => {
    onChange(convertToOldFormat(formData));
  }, [formData, onChange]);

  const handleAccountChange = (value: string) => {
    setFormData(prev => ({ ...prev, adAccountId: value }));
  };

  const handleConnectMeta = () => {
    setIsConnected(true);
    setFormData(prev => ({ 
      ...prev, 
      adAccountId: "account_1",
      selectedCampaigns: [mockCampaigns[0]], // Select first campaign by default
      selectedAdSets: [mockAdSets[0]], // Select an ad set from that campaign
      facebookPageId: mockFacebookPages[0].id,
      instagramAccountId: mockInstagramAccounts[0].id
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
            const matchingAdSet = mockAdSets.find(a => a.id === adSet.id);
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
        const matchingAdSet = mockAdSets.find(a => a.id === adSet.id);
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

  const filteredCampaigns = mockCampaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchCampaign.toLowerCase())
  );

  const filteredAdSets = mockAdSets.filter(adSet => {
    // Only show ad sets from selected campaigns
    const campaignSelected = formData.selectedCampaigns.some(c => c.id === adSet.campaignId);
    if (!campaignSelected) return false;
    
    // Filter by search term
    return adSet.name.toLowerCase().includes(searchAdSet.toLowerCase());
  });

  const getActiveEnhancementsCount = () => {
    return Object.values(formData.advantagePlusEnhancements).filter(Boolean).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Distribution Settings</h2>
      <p className="text-sm text-[#65676B] mb-6">
        Configure your ad distribution settings by connecting to your Meta Ads account.
      </p>
      
      <div className="space-y-6">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-[#E4E6EB] rounded-lg p-8 text-center">
            <div className="mb-4 flex justify-center">
              <svg width="48" height="48" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
                <path fill="#1877F2" d="M96 0a96 96 0 1 0 0 192 96 96 0 0 0 0-192Zm27 96h-17v61H81v-61H64V71h17V58.5C81 40.4 90.9 29 108.1 29c8.2 0 15.3.6 17.4.9v20.1h-11.9c-9.3 0-11.1 4.4-11.1 10.9V71h22.3l-2.8 25Z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Connect Your Meta Account</h3>
            <p className="text-sm text-[#65676B] mb-4">
              Connect your account to select campaigns and ad sets for this ad.
            </p>
            <Button 
              onClick={handleConnectMeta}
              className="bg-[#1877F2] hover:bg-[#0b5fcc] text-white"
            >
              Connect to Meta
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
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

            <div>
              <Label htmlFor="ad_account" className="text-sm font-medium mb-1">Ad Account</Label>
              <Select
                onValueChange={handleAccountChange}
                value={formData.adAccountId}
              >
                <SelectTrigger id="ad_account" className="w-full">
                  <SelectValue placeholder="Select an ad account" />
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
                  className="border rounded-md p-2 min-h-[42px] flex flex-wrap gap-2 cursor-pointer"
                  onClick={() => setShowCampaignDropdown(true)}
                >
                  {formData.selectedCampaigns.length > 0 ? (
                    formData.selectedCampaigns.map(campaign => (
                      <Badge key={campaign.id} variant="secondary" className="flex items-center gap-1 bg-[#F0F2F5] hover:bg-[#E4E6EB]">
                        {campaign.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCampaign(campaign.id);
                          }}
                        />
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[#65676B] text-sm">Select campaigns</span>
                  )}
                </div>

                {showCampaignDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#65676B]" />
                        <Input
                          placeholder="Search campaigns"
                          className="pl-8"
                          value={searchCampaign}
                          onChange={(e) => setSearchCampaign(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <ScrollArea className="h-60">
                      <div className="p-2">
                        {filteredCampaigns.length > 0 ? (
                          filteredCampaigns.map(campaign => (
                            <div
                              key={campaign.id}
                              className="flex items-center gap-2 p-2 hover:bg-[#F7F8FA] rounded-md cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCampaign(campaign);
                              }}
                            >
                              <Checkbox
                                checked={formData.selectedCampaigns.some(c => c.id === campaign.id)}
                                className="h-4 w-4 text-[#1877F2] rounded border-[#CED0D4]"
                              />
                              <span>{campaign.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-[#65676B]">
                            No campaigns found
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    <div className="p-2 border-t flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCampaignDropdown(false);
                        }}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {formData.selectedCampaigns.length > 0 && (
                <p className="text-xs text-[#65676B] mt-1">
                  {formData.selectedCampaigns.length} campaign{formData.selectedCampaigns.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Ad Set Multi-Selector */}
            <div>
              <Label className="text-sm font-medium mb-1">Ad Sets</Label>
              <div className="relative">
                <div
                  className={`border rounded-md p-2 min-h-[42px] flex flex-wrap gap-2 cursor-pointer ${formData.selectedCampaigns.length === 0 ? 'bg-[#F7F8FA] opacity-70' : ''}`}
                  onClick={() => {
                    if (formData.selectedCampaigns.length > 0) {
                      setShowAdSetDropdown(true);
                    }
                  }}
                >
                  {formData.selectedAdSets.length > 0 ? (
                    formData.selectedAdSets.map(adSet => (
                      <Badge key={adSet.id} variant="secondary" className="flex items-center gap-1 bg-[#F0F2F5] hover:bg-[#E4E6EB]">
                        {adSet.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAdSet(adSet.id);
                          }}
                        />
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[#65676B] text-sm">
                      {formData.selectedCampaigns.length === 0 
                        ? "Select campaigns first" 
                        : "Select ad sets"}
                    </span>
                  )}
                </div>

                {showAdSetDropdown && formData.selectedCampaigns.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#65676B]" />
                        <Input
                          placeholder="Search ad sets"
                          className="pl-8"
                          value={searchAdSet}
                          onChange={(e) => setSearchAdSet(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <ScrollArea className="h-60">
                      <div className="p-2">
                        {filteredAdSets.length > 0 ? (
                          filteredAdSets.map(adSet => (
                            <div
                              key={adSet.id}
                              className="flex items-center gap-2 p-2 hover:bg-[#F7F8FA] rounded-md cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleAdSet(adSet);
                              }}
                            >
                              <Checkbox
                                checked={formData.selectedAdSets.some(a => a.id === adSet.id)}
                                className="h-4 w-4 text-[#1877F2] rounded border-[#CED0D4]"
                              />
                              <div className="flex-1">
                                <div>{adSet.name}</div>
                                <div className="text-xs text-[#65676B]">
                                  {mockCampaigns.find(c => c.id === adSet.campaignId)?.name}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-[#65676B]">
                            No ad sets found for selected campaigns
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    <div className="p-2 border-t flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAdSetDropdown(false);
                        }}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {formData.selectedAdSets.length > 0 && (
                <p className="text-xs text-[#65676B] mt-1">
                  {formData.selectedAdSets.length} ad set{formData.selectedAdSets.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Social Media Pages */}
            <div className="border-t border-[#E4E6EB] pt-5 space-y-5">
              <h3 className="text-base font-medium">Social Media Pages</h3>
              
              <div>
                <Label htmlFor="facebook_page" className="text-sm font-medium flex items-center gap-2 mb-1">
                  <Facebook className="h-4 w-4 text-[#1877F2]" /> Facebook Page
                </Label>
                <Select
                  onValueChange={handleFacebookPageChange}
                  value={formData.facebookPageId}
                >
                  <SelectTrigger id="facebook_page" className="w-full">
                    <SelectValue placeholder="Select a Facebook page" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFacebookPages.map(page => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="instagram_account" className="text-sm font-medium flex items-center gap-2 mb-1">
                  <Instagram className="h-4 w-4 text-[#C13584]" /> Instagram Account
                </Label>
                <Select
                  onValueChange={handleInstagramAccountChange}
                  value={formData.instagramAccountId}
                >
                  <SelectTrigger id="instagram_account" className="w-full">
                    <SelectValue placeholder="Select an Instagram account" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockInstagramAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ad Settings */}
            <div className="border-t border-[#E4E6EB] pt-5 space-y-5">
              <h3 className="text-base font-medium">Advanced Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="multi_advertiser" className="text-sm font-medium">Allow Multi-advertiser ads</Label>
                  <p className="text-xs text-[#65676B]">Allow your ad to appear with other ads from Meta advertisers</p>
                </div>
                <Switch
                  id="multi_advertiser"
                  checked={formData.allowMultiAdvertiserAds}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, allowMultiAdvertiserAds: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="flexible_media" className="text-sm font-medium">Flexible Media</Label>
                  <p className="text-xs text-[#65676B]">Allow Meta to adjust your media for different placements</p>
                </div>
                <Switch
                  id="flexible_media"
                  checked={formData.enableFlexibleMedia}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, enableFlexibleMedia: checked }))
                  }
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Label className="text-sm font-medium">Advantage+ Creative Enhancements</Label>
                    <p className="text-xs text-[#65676B]">Select creative optimizations for your ad</p>
                  </div>
                  <Badge variant="outline" className="bg-[#F0F2F5]">
                    {getActiveEnhancementsCount()} active
                  </Badge>
                </div>
                
                <Accordion type="single" collapsible className="border rounded-md">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="px-4 py-3 text-sm">View all enhancements</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4 mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* First row */}
                          <div className="flex items-center justify-between border rounded-md p-3">
                            <div>
                              <p className="text-sm font-medium">Translate text</p>
                              <p className="text-xs text-[#65676B]">Auto-translate to viewer's language</p>
                            </div>
                            <Switch
                              checked={formData.advantagePlusEnhancements.translateText}
                              onCheckedChange={() => handleToggleEnhancement('translateText')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between border rounded-md p-3">
                            <div>
                              <p className="text-sm font-medium">Add overlays</p>
                              <p className="text-xs text-[#65676B]">Add text overlays to your image</p>
                            </div>
                            <Switch
                              checked={formData.advantagePlusEnhancements.addOverlays}
                              onCheckedChange={() => handleToggleEnhancement('addOverlays')}
                            />
                          </div>
                          
                          {/* Second row */}
                          <div className="flex items-center justify-between border rounded-md p-3">
                            <div>
                              <p className="text-sm font-medium">Add catalog items</p>
                              <p className="text-xs text-[#65676B]">Include relevant products from catalog</p>
                            </div>
                            <Switch
                              checked={formData.advantagePlusEnhancements.addCatalogItems}
                              onCheckedChange={() => handleToggleEnhancement('addCatalogItems')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between border rounded-md p-3">
                            <div>
                              <p className="text-sm font-medium">Visual touch-ups</p>
                              <p className="text-xs text-[#65676B]">Enhance image quality automatically</p>
                            </div>
                            <Switch
                              checked={formData.advantagePlusEnhancements.visualTouchUps}
                              onCheckedChange={() => handleToggleEnhancement('visualTouchUps')}
                            />
                          </div>
                          
                          {/* Third row */}
                          <div className="flex items-center justify-between border rounded-md p-3">
                            <div>
                              <p className="text-sm font-medium">Music</p>
                              <p className="text-xs text-[#65676B]">Add background music to videos</p>
                            </div>
                            <Switch
                              checked={formData.advantagePlusEnhancements.music}
                              onCheckedChange={() => handleToggleEnhancement('music')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between border rounded-md p-3">
                            <div>
                              <p className="text-sm font-medium">3D animation</p>
                              <p className="text-xs text-[#65676B]">Add depth and motion effects</p>
                            </div>
                            <Switch
                              checked={formData.advantagePlusEnhancements.animation3d}
                              onCheckedChange={() => handleToggleEnhancement('animation3d')}
                            />
                          </div>
                          
                          {/* Fourth row */}
                          <div className="flex items-center justify-between border rounded-md p-3">
                            <div>
                              <p className="text-sm font-medium">Text improvements</p>
                              <p className="text-xs text-[#65676B]">Optimize headline and description</p>
                            </div>
                            <Switch
                              checked={formData.advantagePlusEnhancements.textImprovements}
                              onCheckedChange={() => handleToggleEnhancement('textImprovements')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between border rounded-md p-3">
                            <div>
                              <p className="text-sm font-medium">Store locations</p>
                              <p className="text-xs text-[#65676B]">Show nearest store to viewers</p>
                            </div>
                            <Switch
                              checked={formData.advantagePlusEnhancements.storeLocations}
                              onCheckedChange={() => handleToggleEnhancement('storeLocations')}
                            />
                          </div>
                          
                          {/* Fifth row */}
                          <div className="flex items-center justify-between border rounded-md p-3">
                            <div>
                              <p className="text-sm font-medium">Enhance CTA</p>
                              <p className="text-xs text-[#65676B]">Optimize call-to-action button</p>
                            </div>
                            <Switch
                              checked={formData.advantagePlusEnhancements.enhanceCta}
                              onCheckedChange={() => handleToggleEnhancement('enhanceCta')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between border rounded-md p-3">
                            <div>
                              <p className="text-sm font-medium">Add site links</p>
                              <p className="text-xs text-[#65676B]">Include additional links in ad</p>
                            </div>
                            <Switch
                              checked={formData.advantagePlusEnhancements.addSiteLinks}
                              onCheckedChange={() => handleToggleEnhancement('addSiteLinks')}
                            />
                          </div>
                          
                          {/* Last item */}
                          <div className="flex items-center justify-between border rounded-md p-3">
                            <div>
                              <p className="text-sm font-medium">Image animation</p>
                              <p className="text-xs text-[#65676B]">Add subtle movement to static images</p>
                            </div>
                            <Switch
                              checked={formData.advantagePlusEnhancements.imageAnimation}
                              onCheckedChange={() => handleToggleEnhancement('imageAnimation')}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
