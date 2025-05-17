import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MediaUploader } from "@/components/ad-creator/media-uploader";
import { TemplateSelector } from "@/components/ad-creator/template-selector";
import { AdTextForm } from "@/components/ad-creator/ad-text-form";
import { BrandSettings } from "@/components/ad-creator/brand-settings";
import { AdTargeting } from "@/components/ad-creator/ad-targeting";
import { AdPreview } from "@/components/ad-creator/ad-preview";
import { AdSummary } from "@/components/ad-creator/ad-summary";
import { CombinedTypeSelector } from "@/components/ad-creator/combined-type-selector";
import { PlacementCustomizer } from "@/components/ad-creator/placement-customizer";
import type { PlacementMediaData } from "@/components/ad-creator/placement-customizer";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, Sparkles } from "lucide-react";

// Define proper interfaces for our state objects
interface AdSetConfig {
  id: string;
  name: string;
  audience?: string;
  campaignId?: string;
}

interface AdData {
  templateId: number;
  adType: string;
  adFormat: string;
  mediaUrl: string;
  primaryText: string;
  headline: string;
  description: string;
  cta: string;
  websiteUrl: string;
  brandName: string;
  status: string;
  customizePlacements: boolean;
  facebookPage: string;
  instagramAccount: string;
  hasAppliedAiSuggestions: boolean;
}

interface TargetingData {
  adAccountId: string;
  campaignObjective?: string;
  placements?: string[];
  adSets: AdSetConfig[];
  facebookPageId?: string;
  instagramAccountId?: string;
  facebookPageName?: string;
  instagramAccountName?: string;
  // Add additional properties for better data persistence
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

interface AiSuggestions {
  suggestedHeadline: string;
  suggestedPrimaryText: string;
  suggestedDescription: string;
  suggestedCta: string;
}

export default function AdCreator() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  
  // Step state (1: Create, 2: Target, 3: Launch)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Get step from localStorage on initial load
  useEffect(() => {
    const storedStep = localStorage.getItem('adCreatorStep');
    if (storedStep) {
      setCurrentStep(parseInt(storedStep));
    } else {
      localStorage.setItem('adCreatorStep', '1');
    }
  }, []);
  
  // Auth dialog state
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // State for AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions | null>(null);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  
  // Placement media (for customized placements)
  const [placementMedia, setPlacementMedia] = useState<PlacementMediaData>({
    feeds: "",
    stories: "",
    rightColumn: ""
  });
  
  // Ad data state
  const [adData, setAdData] = useState<AdData>({
    templateId: 1,
    adType: "conversions",
    adFormat: "image", // Make image selected by default
    mediaUrl: "",
    primaryText: "Transform your social media presence with our AI-powered design tools. No design skills needed!",
    headline: "Create stunning ads in minutes!",
    description: "No design skills needed. Try it today!",
    cta: "sign_up",
    websiteUrl: "https://example.com/signup",
    brandName: "DraperAds",
    status: "draft",
    customizePlacements: false, // Whether to use different creatives for different placements
    facebookPage: "",
    instagramAccount: "",
    hasAppliedAiSuggestions: false // Track whether AI suggestions are applied
  });
  
  // Ad targeting state
  const [targetingData, setTargetingData] = useState<TargetingData>({
    adAccountId: "account_1",
    campaignObjective: "traffic",
    placements: ["facebook", "instagram"],
    adSets: [
      { id: "set1", name: "Main Audience", audience: "Broad - 25-54 age range" }
    ],
    facebookPageId: "",
    instagramAccountId: "",
    facebookPageName: "",
    instagramAccountName: "",
    allowMultiAdvertiserAds: false,
    enableFlexibleMedia: false,
    advantagePlusEnhancements: {
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
      imageAnimation: false
    }
  });
  
  // Meta connection state
  const [isMetaConnected, setIsMetaConnected] = useState(false);
  
  // Create or update ad mutation
  const createAdMutation = useMutation({
    mutationFn: async () => {
      // Include current step, ad type fields, and targeting information when saving
      const adDataToSave = {
        ...adData,
        adType: adData.adType,
        adFormat: adData.adFormat,
        customizePlacements: adData.customizePlacements,
        // Include targeting data key fields
        targetingAdAccountId: targetingData.adAccountId,
        targetingCampaignObjective: targetingData.campaignObjective,
        targetingFacebookPageId: targetingData.facebookPageId,
        targetingFacebookPageName: targetingData.facebookPageName,
        targetingInstagramAccountId: targetingData.instagramAccountId,
        targetingInstagramAccountName: targetingData.instagramAccountName,
        // Convert complex objects to JSON strings to ensure they are saved
        targetingAdSets: JSON.stringify(targetingData.adSets),
        targetingPlacements: targetingData.placements ? JSON.stringify(targetingData.placements) : JSON.stringify(['facebook', 'instagram'])
      };
      
      // Create or update ad
      const response = await apiRequest('/api/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adDataToSave)
      });
      
      return response;
    }
  });
  
  // Get latest draft ad
  const { data: draftAd, isLoading: isLoadingDraft } = useQuery({
    queryKey: ['/api/ads/draft/latest'], 
    staleTime: Infinity // Don't refetch automatically
  });
  
  // Initialize from draft ad data when available
  useEffect(() => {
    if (draftAd && !isLoadingDraft) {
      // Base ad data
      setAdData(prevData => ({
        ...prevData,
        ...draftAd,
        // Prioritize some values from previous state if they exist
        mediaUrl: draftAd.mediaUrl || prevData.mediaUrl,
        primaryText: draftAd.primaryText || prevData.primaryText,
        headline: draftAd.headline || prevData.headline,
        description: draftAd.description || prevData.description,
        websiteUrl: draftAd.websiteUrl || prevData.websiteUrl,
        brandName: draftAd.brandName || prevData.brandName,
        adType: draftAd.adType || prevData.adType,
        adFormat: draftAd.adFormat || prevData.adFormat,
        customizePlacements: draftAd.customizePlacements || prevData.customizePlacements,
      }));
      
      // Complex targeting data requires more careful handling
      try {
        // Start with a base object
        const updatedTargetingData: Partial<TargetingData> = {
          adAccountId: draftAd.targetingAdAccountId || targetingData.adAccountId,
          campaignObjective: draftAd.targetingCampaignObjective || targetingData.campaignObjective,
          facebookPageId: draftAd.targetingFacebookPageId || targetingData.facebookPageId,
          facebookPageName: draftAd.targetingFacebookPageName || targetingData.facebookPageName,
          instagramAccountId: draftAd.targetingInstagramAccountId || targetingData.instagramAccountId,
          instagramAccountName: draftAd.targetingInstagramAccountName || targetingData.instagramAccountName,
          // Parse complex fields if they exist
          adSets: draftAd.targetingAdSets 
            ? JSON.parse(draftAd.targetingAdSets)
            : targetingData.adSets,
          placements: draftAd.targetingPlacements
            ? JSON.parse(draftAd.targetingPlacements)
            : targetingData.placements
        };
        
        setTargetingData(prevTargeting => ({
          ...prevTargeting,
          ...updatedTargetingData
        }));
      } catch (e) {
        // If there's an error parsing the JSON, just use the default data
        console.error("Error parsing targeting data:", e);
      }
    }
  }, [draftAd, isLoadingDraft]);
  
  // Debounce timer for saving changes
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-save changes with debouncing
  useEffect(() => {
    // Clear any existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    // Skip initial render
    if (!adData.mediaUrl && !adData.primaryText) {
      return;
    }
    
    // Set a new timer
    saveTimerRef.current = setTimeout(() => {
      console.log("Auto-saving ad data...");
      createAdMutation.mutate();
    }, 2000); // 2 second debounce
    
    // Clean up on unmount
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [adData, targetingData]);
  
  // Set step in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('adCreatorStep', currentStep.toString());
    
    // Auto-save when moving between steps
    if (adData.mediaUrl || adData.primaryText) {
      createAdMutation.mutate();
    }
  }, [currentStep]);
  
  // Methods to handle progression between steps
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handlers for updates to different aspects of the ad
  const handleAdTextChange = (values: any) => {
    setAdData(prevData => ({
      ...prevData,
      primaryText: values.primaryText,
      headline: values.headline,
      description: values.description || "",
      cta: values.cta,
      websiteUrl: values.websiteUrl
    }));
  };
  
  const handleTargetingChange = (values: TargetingData) => {
    // Clear any existing debounce timer for targeting changes
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    // Update the state with the new targeting data
    const newTargetingData: TargetingData = {
      ...targetingData,
      ...values,
      // Ensure adSets is properly set - either from the values or from existing state
      adSets: values.adSets || targetingData.adSets,
      // Handle specific object properties that might not be included in the update
      advantagePlusEnhancements: {
        ...targetingData.advantagePlusEnhancements,
        ...(values.advantagePlusEnhancements || {})
      }
    };
    
    // Update state
    setTargetingData(newTargetingData);
    
    // Update Facebook/Instagram account in ad data
    setAdData(prev => ({
      ...prev,
      facebookPage: values.facebookPageName || prev.facebookPage,
      instagramAccount: values.instagramAccountName || prev.instagramAccount
    }));
    
    // Set a new debounce timer for auto-saving
    saveTimerRef.current = setTimeout(() => {
      console.log("Auto-saving targeting data...");
      createAdMutation.mutate();
    }, 1000); // 1 second debounce for targeting changes
  };
  
  const handleMediaUpload = (mediaUrl: string) => {
    setAdData(prevData => ({
      ...prevData,
      mediaUrl
    }));
    
    // Also update the media in placementMedia.feeds
    setPlacementMedia(prev => ({
      ...prev,
      feeds: mediaUrl
    }));
  };
  
  const handleSuggestionsGenerated = (suggestions: AiSuggestions) => {
    setAiSuggestions(suggestions);
    setGeneratingSuggestions(false);
  };
  
  // Function to publish ad when Meta is connected
  const handlePublishAd = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    
    // Create temporary ad first
    await createAdMutation.mutateAsync();
    
    // Call publish endpoint
    try {
      const response = await apiRequest('/api/ads/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adId: draftAd?.id,
          // Add targeting info for publishing
          adFormat: adData.adFormat,
          customizePlacements: adData.customizePlacements,
          targetingData: {
            adAccountId: targetingData.adAccountId,
            campaignObjective: targetingData.campaignObjective,
            placements: targetingData.placements,
            adSets: targetingData.adSets,
            facebookPageId: targetingData.facebookPageId,
            instagramAccountId: targetingData.instagramAccountId
          }
        })
      });
      
      toast({
        title: "Ad published successfully!",
        description: "Your ad has been sent to Meta for review.",
        duration: 5000
      });
      
      // Reset the ad creator
      // localStorage.removeItem('adCreatorStep');
      // localStorage.removeItem('adData');
      // localStorage.removeItem('targetingData');
      
      // Navigate to the ad history page
      navigate('/ad-history');
      
    } catch (error) {
      console.error("Error publishing ad:", error);
      toast({
        title: "Error publishing ad",
        description: "There was a problem publishing your ad. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Editor Panel */}
        <div className="lg:w-7/12">
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Design Your Ad</h2>
              
              {/* Combined Type Selector - Type and Format */}
              <div className="mb-8">
                <CombinedTypeSelector
                  onTypeChange={(type) => setAdData(prev => ({ ...prev, adType: type }))}
                  onFormatChange={(format) => setAdData(prev => ({ ...prev, adFormat: format }))}
                  defaultType={adData.adType}
                  defaultFormat={adData.adFormat}
                />
              </div>
              
              <div className="border-t pt-8 mb-8">
                <h3 className="text-lg font-medium mb-6">Creative Assets</h3>
                
                {/* Media Upload */}
                <div className="mb-8">
                  <MediaUploader 
                    onMediaUpload={handleMediaUpload}
                    onSuggestionsGenerated={handleSuggestionsGenerated} 
                    value={adData.mediaUrl}
                  />
                </div>
                
                {/* Placement Customizer - Right after Media Upload */}
                <div className="mb-8">
                  <PlacementCustomizer
                    defaultUseCustomPlacements={adData.customizePlacements}
                    defaultMedia={{
                      feeds: adData.mediaUrl,
                      stories: placementMedia.stories,
                      rightColumn: placementMedia.rightColumn
                    }}
                    onCustomizationToggle={(enabled: boolean) => {
                      setAdData(prev => ({ ...prev, customizePlacements: enabled }));
                    }}
                    onMediaUpdate={(newMedia: PlacementMediaData) => {
                      setPlacementMedia(newMedia);
                    }}
                  />
                </div>
                
                {/* Ad Copy Section */}
                <div className="mb-8 border-t pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium">Ad Copy</h3>
                    
                    {/* AI Badge Indication */}
                    {adData.mediaUrl && !generatingSuggestions && aiSuggestions && adData.hasAppliedAiSuggestions && (
                      <div className="bg-green-50 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-sm text-green-700">AI-Generated Copy Applied</span>
                        <Button
                          onClick={() => {
                            setAdData(prev => ({
                              ...prev,
                              primaryText: "",
                              headline: "",
                              description: "",
                              cta: "learn_more",
                              hasAppliedAiSuggestions: false
                            }));
                            
                            toast({
                              title: "Text cleared",
                              description: "AI suggestions have been removed.",
                            });
                          }}
                          type="button"
                          variant="outline"
                          className="border-gray-200 text-gray-700 hover:bg-gray-100 h-7 ml-2"
                          size="sm"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                    
                    {adData.mediaUrl && !generatingSuggestions && aiSuggestions && !adData.hasAppliedAiSuggestions && (
                      <div className="bg-yellow-50 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-sm text-amber-700">AI Suggestions Available</span>
                        <Button
                          onClick={() => {
                            handleAdTextChange({
                              primaryText: aiSuggestions.suggestedPrimaryText,
                              headline: aiSuggestions.suggestedHeadline,
                              description: aiSuggestions.suggestedDescription,
                              cta: aiSuggestions.suggestedCta,
                              websiteUrl: adData.websiteUrl
                            });
                            
                            setAdData(prev => ({
                              ...prev,
                              hasAppliedAiSuggestions: true
                            }));
                            
                            toast({
                              title: "AI suggestions applied",
                              description: "The ad copy has been updated with AI-generated suggestions.",
                            });
                          }}
                          type="button"
                          variant="outline"
                          className="bg-yellow-50 text-[#f6242f] hover:opacity-90 border-yellow-200 h-7 ml-2"
                          size="sm"
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Ad Text Form */}
                  <AdTextForm 
                    onSubmit={handleAdTextChange}
                    defaultValues={{
                      primaryText: adData.primaryText,
                      headline: adData.headline,
                      description: adData.description,
                      cta: adData.cta,
                      websiteUrl: adData.websiteUrl
                    }}
                  />
                </div>
                
                {/* Brand Settings - At the end */}
                <div className="mb-8 border-t pt-6">
                  <h3 className="text-lg font-medium mb-6">Brand Identity</h3>
                  <BrandSettings 
                    onBrandChange={(values) => {
                      setAdData(prev => ({ 
                        ...prev, 
                        brandName: values.brandName 
                      }))
                    }}
                    brandName={adData.brandName}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Targeting - Step 2 */}
          {currentStep === 2 && (
            <AdTargeting 
              onChange={handleTargetingChange} 
              defaultValues={{
                adAccountId: targetingData.adAccountId,
                selectedCampaigns: targetingData.adSets
                  .filter(adSet => adSet.campaignId)
                  .map(adSet => {
                    // Find unique campaigns from ad sets
                    const campaignId = adSet.campaignId || "";
                    let campaignName = "";
                    
                    // Use actual campaign names based on IDs
                    if (campaignId === "c1_1") {
                      campaignName = "Summer Sale 2025";
                    } else if (campaignId === "c1_2") {
                      campaignName = "Product Launch: Eco Series";
                    } else if (campaignId === "c1_3") {
                      campaignName = "Brand Awareness Q2";
                    } else if (campaignId === "c2_1") {
                      campaignName = "Winter Holiday Special";
                    } else if (campaignId === "c2_2") {
                      campaignName = "Lead Generation - Enterprise";
                    } else if (campaignId === "c2_3") {
                      campaignName = "Social Media Contest";
                    } else {
                      campaignName = "Campaign " + campaignId;
                    }
                    
                    // Convert to the format AdTargetingFormData expects
                    return { 
                      id: campaignId, 
                      name: campaignName,
                      status: "ACTIVE" 
                    };
                  }),
                selectedAdSets: targetingData.adSets.map(adSet => ({
                  id: adSet.id,
                  name: adSet.name,
                  campaignId: adSet.campaignId || "",
                  status: "ACTIVE"
                })),
                facebookPageId: targetingData.facebookPageId || "",
                instagramAccountId: targetingData.instagramAccountId || "",
                allowMultiAdvertiserAds: targetingData.allowMultiAdvertiserAds || false,
                enableFlexibleMedia: targetingData.enableFlexibleMedia || false,
                advantagePlusEnhancements: targetingData.advantagePlusEnhancements || {
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
                  imageAnimation: false
                }
              }}
              onConnectionChange={(isConnected) => {
                setIsMetaConnected(isConnected);
              }}
              isConnected={isMetaConnected}
            />
          )}
          
          {/* Launch - Step 3 */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Launch Your Ad</h2>
              
              <div className="mb-4">
                <div className="grid lg:grid-cols-1">
                  {/* Ad Summary */}
                  <div className="bg-gray-50 p-6 rounded-md">
                    <AdSummary 
                      adName="New Conversion Ad"
                      onAdNameChange={(name) => {
                        console.log("Ad name changed:", name);
                      }}
                      adAccountName={`${targetingData.adAccountId}`}
                      campaigns={targetingData.adSets
                        .filter(adSet => adSet.campaignId)
                        .map(adSet => {
                          // Find unique campaigns from ad sets
                          const campaignId = adSet.campaignId || "";
                          let campaignName = "";
                          
                          // Use actual campaign names based on IDs
                          if (campaignId === "c1_1") {
                            campaignName = "Summer Sale 2025";
                          } else if (campaignId === "c1_2") {
                            campaignName = "Product Launch: Eco Series";
                          } else if (campaignId === "c1_3") {
                            campaignName = "Brand Awareness Q2";
                          } else if (campaignId === "c2_1") {
                            campaignName = "Winter Holiday Special";
                          } else if (campaignId === "c2_2") {
                            campaignName = "Lead Generation - Enterprise";
                          } else if (campaignId === "c2_3") {
                            campaignName = "Social Media Contest";
                          } else {
                            campaignName = "Campaign " + campaignId;
                          }
                          
                          return { 
                            id: campaignId, 
                            name: campaignName,
                          };
                        })}
                      adSets={targetingData.adSets.map(adSet => ({
                        id: adSet.id,
                        name: adSet.name,
                        campaignId: adSet.campaignId
                      }))}
                      facebookPage={targetingData.facebookPageName || ""}
                      instagramAccount={targetingData.instagramAccountName || ""}
                      allowMultiAdvertiserAds={targetingData.allowMultiAdvertiserAds}
                      enableFlexibleMedia={targetingData.enableFlexibleMedia}
                      advantagePlusEnhancements={targetingData.advantagePlusEnhancements}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Once you click "Publish to Meta," your ad will be reviewed according to Meta's advertising policies.
                  </div>
                  <Button
                    onClick={handlePublishAd}
                    disabled={!isMetaConnected || createAdMutation.isPending}
                    className={`w-full sm:w-auto ${!isMetaConnected ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : 'bg-[#f6242f] hover:opacity-90'}`}
                  >
                    Publish to Meta
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <Button
                onClick={handlePrevStep}
                variant="outline"
                className="flex gap-2 items-center"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                Back
              </Button>
            ) : (
              <div></div> // Empty div for flexbox spacing
            )}
            
            {currentStep < 3 ? (
              <Button
                onClick={handleNextStep}
                className="flex gap-2 items-center bg-[#f6242f] hover:opacity-90 text-white"
              >
                {currentStep === 1 ? "Continue to Targeting" : "Continue to Launch"}
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.1584 3.13514C5.95694 3.32401 5.94673 3.64042 6.13559 3.84188L9.565 7.49991L6.13559 11.1579C5.94673 11.3594 5.95694 11.6758 6.1584 11.8647C6.35986 12.0535 6.67627 12.0433 6.86514 11.8419L10.6151 7.84188C10.7954 7.64955 10.7954 7.35027 10.6151 7.15794L6.86514 3.15794C6.67627 2.95648 6.35986 2.94628 6.1584 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            ) : (
              <div></div> // Empty div for flexbox spacing
            )}
          </div>
        </div>
        
        {/* Preview Panel */}
        <div className="lg:w-5/12">
          {/* Preview Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-medium mb-4">Ad Preview</h3>
            
            <AdPreview
              brandName={adData.brandName}
              mediaUrl={adData.customizePlacements ? 
                (currentStep === 1 ? placementMedia.feeds : placementMedia.feeds) : 
                adData.mediaUrl
              }
              storiesMediaUrl={adData.customizePlacements ? placementMedia.stories : undefined}
              primaryText={adData.primaryText}
              headline={adData.headline}
              description={adData.description}
              cta={adData.cta}
              websiteUrl={adData.websiteUrl}
              customizedPlacements={adData.customizePlacements}
              facebookPage={targetingData.facebookPageName}
              instagramAccount={targetingData.instagramAccountName}
            />
            
            {aiSuggestions && generatingSuggestions && (
              <div className="mt-4 p-3 bg-amber-50 rounded-md flex items-center gap-2 text-amber-700 text-sm">
                <Sparkles className="h-4 w-4" />
                <span>AI is analyzing your image to generate text suggestions...</span>
              </div>
            )}
            
            {/* Save indicator */}
            {createAdMutation.isPending && (
              <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-[#f6242f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving changes...</span>
              </div>
            )}
            
            {createAdMutation.isSuccess && !createAdMutation.isPending && (
              <div className="mt-4 text-sm text-green-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>All changes saved</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Auth Dialog */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
      />
    </div>
  );
}