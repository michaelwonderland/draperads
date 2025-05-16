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
  const { data: latestDraft } = useQuery<any>({
    queryKey: ['/api/ads/draft/latest'],
    // @ts-ignore - onSuccess is present but TypeScript doesn't recognize it
    onSuccess: (data: any) => {
      if (data) {
        // Allow draft loading only when at step 1 (creation)
        if (currentStep === 1) {
          // Populate ad data from draft
          setAdData({
            templateId: data.templateId || 1,
            adType: data.adType || "conversions",
            adFormat: data.adFormat || "single-image",
            mediaUrl: data.mediaUrl || "",
            primaryText: data.primaryText || "",
            headline: data.headline || "",
            description: data.description || "",
            cta: data.cta || "learn_more",
            websiteUrl: data.websiteUrl || "https://example.com",
            brandName: data.brandName || "DraperAds",
            status: data.status || "draft",
            customizePlacements: data.customizePlacements || false,
            facebookPage: data.facebookPage || "",
            instagramAccount: data.instagramAccount || "",
            hasAppliedAiSuggestions: data.hasAppliedAiSuggestions || false
          });
          
          // If we have targeting data from the draft, use it
          if (data.targetingAdAccountId || data.targetingAdSets) {
            // Parse complex objects if they exist
            let parsedAdSets = [];
            try {
              if (data.targetingAdSets) {
                parsedAdSets = JSON.parse(data.targetingAdSets);
              }
            } catch (e) {
              console.error("Failed to parse targetingAdSets JSON:", e);
            }
            
            let parsedPlacements = ["facebook", "instagram"];
            try {
              if (data.targetingPlacements) {
                parsedPlacements = JSON.parse(data.targetingPlacements);
              }
            } catch (e) {
              console.error("Failed to parse targetingPlacements JSON:", e);
            }
            
            setTargetingData({
              adAccountId: data.targetingAdAccountId || "",
              campaignObjective: data.targetingCampaignObjective || "traffic",
              placements: parsedPlacements,
              adSets: parsedAdSets.length > 0 ? parsedAdSets : [{ id: "set1", name: "Main Audience", audience: "Broad - 25-54 age range" }],
              facebookPageId: data.targetingFacebookPageId || "",
              facebookPageName: data.targetingFacebookPageName || "",
              instagramAccountId: data.targetingInstagramAccountId || "",
              instagramAccountName: data.targetingInstagramAccountName || ""
            });
            
            // Set Facebook Page and Instagram Account from targeting data to ensure UI state is synced
            setAdData(prev => ({
              ...prev,
              facebookPage: data.targetingFacebookPageName || "",
              instagramAccount: data.targetingInstagramAccountName || ""
            }));
          }
        }
      }
    }
  });
  
  // Get ad accounts
  const { data: adAccounts } = useQuery({
    queryKey: ['/api/ad-accounts'],
  });
  
  // Publish ad
  const publishAdMutation = useMutation({
    mutationFn: async () => {
      // Check if user is authenticated
      if (!isAuthenticated) {
        setShowAuthDialog(true);
        throw new Error("Authentication required");
      }
      
      // Publish ad
      // Safely extract ID from latestDraft
      const adId = typeof latestDraft === 'object' && latestDraft !== null && 'id' in latestDraft 
        ? latestDraft.id 
        : 0;
        
      const response = await apiRequest('/api/ads/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adId: adId,
          adSets: targetingData.adSets
        })
      });
      
      return response;
    },
    onSuccess: async (results) => {
      toast({
        title: "Success",
        description: `Your ad has been published to ${targetingData.adSets.length} ad sets.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      navigate('/ad-history');
    },
    onError: (error: any) => {
      // If it's an authentication error, we already show the auth dialog
      if (error.message === "Authentication required") {
        return;
      }
      
      toast({
        title: "Error",
        description: `Failed to publish ad: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle media upload
  const handleMediaUpload = (mediaUrl: string) => {
    setAdData(prev => ({ ...prev, mediaUrl }));
  };
  
  // Handle AI-generated suggestions
  const handleSuggestionsGenerated = (suggestions: {
    suggestedHeadline: string;
    suggestedPrimaryText: string;
    suggestedDescription: string;
    suggestedCta: string;
  }) => {
    // Start generating suggestions
    setGeneratingSuggestions(true);
    
    // Simulate a short delay to show the generating indicator
    setTimeout(() => {
      setAiSuggestions(suggestions);
      setGeneratingSuggestions(false);
      
      // Immediately apply the suggestions to the ad text
      handleAdTextChange({
        primaryText: suggestions.suggestedPrimaryText,
        headline: suggestions.suggestedHeadline,
        description: suggestions.suggestedDescription || "",
        cta: suggestions.suggestedCta,
        websiteUrl: adData.websiteUrl
      });
      
      setAdData(prev => ({
        ...prev,
        hasAppliedAiSuggestions: true
      }));
    }, 1000);
  };
  
  // Handle ad text changes
  const handleAdTextChange = (values: {
    primaryText: string;
    headline: string;
    description?: string;
    cta: string;
    websiteUrl: string;
  }) => {
    setAdData(prev => ({
      ...prev,
      primaryText: values.primaryText,
      headline: values.headline,
      description: values.description || "",
      cta: values.cta,
      websiteUrl: values.websiteUrl
    }));
  };
  
  // Use a ref to debounce saving changes
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle targeting changes 
  const handleTargetingChange = (values: TargetingData) => {
    // Store brand identity (Facebook Page & Instagram Account) in Ad Data too
    // so they appear in the preview without requiring format conversion
    setAdData(prev => ({
      ...prev,
      facebookPage: values.facebookPageName || "",
      instagramAccount: values.instagramAccountName || ""
    }));
    
    // Clone the input to avoid direct mutation
    const newTargetingData: TargetingData = {
      adAccountId: values.adAccountId,
      campaignObjective: values.campaignObjective,
      placements: values.placements, 
      adSets: [...values.adSets], // Important to deep clone the array
      facebookPageId: values.facebookPageId,
      facebookPageName: values.facebookPageName,
      instagramAccountId: values.instagramAccountId,
      instagramAccountName: values.instagramAccountName
    };
    
    // First update the state
    setTargetingData(newTargetingData);
    
    // Cancel previous timeout if it exists
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce save operation to prevent rapid API calls
    saveTimeoutRef.current = setTimeout(() => {
      console.log("Auto-saving targeting changes (debounced)");
      // We don't await this since it's a background save
      try {
        createAdMutation.mutate();
      } catch (error) {
        console.error("Background save of targeting data failed:", error);
      }
      saveTimeoutRef.current = null;
    }, 1000); // Debounce for 1 second
  };
  
  // Handle save draft button
  const handleSaveDraft = () => {
    createAdMutation.mutate();
    toast({
      title: "Success",
      description: "Your ad draft has been saved.",
    });
  };
  
  // Handle auth dialog close
  const handleCloseAuthDialog = () => {
    setShowAuthDialog(false);
  };
  
  // Handle login success
  const handleLoginSuccess = () => {
    // Continue with ad publishing
    handlePublish();
  };
  
  // Handle next step
  const handleNextStep = async () => {
    if (currentStep < 3) {
      // First, ensure all data is saved - especially when going from Step 2 to Step 3
      if (currentStep === 2) {
        try {
          // Await the mutation to ensure targeting data is fully saved before proceeding
          // This is critical to ensure all selections are securely stored
          await createAdMutation.mutateAsync();
          
          console.log("Successfully saved all targeting data before proceeding to Step 3");
        } catch (error) {
          console.error("Error saving targeting data:", error);
          // Show error toast but still proceed to next step
          toast({
            title: "Warning",
            description: "There was an issue saving your targeting selections. Your changes might not be preserved.",
            variant: "destructive",
          });
        }
      } else {
        // For other steps, save in the background without blocking
        try {
          createAdMutation.mutate();
        } catch (error) {
          console.log("Background save attempt will continue in the background");
        }
      }
      
      // Now proceed to next step
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // Update localStorage to sync with header
      localStorage.setItem('adCreatorStep', newStep.toString());
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      
      // Update localStorage to sync with header
      localStorage.setItem('adCreatorStep', newStep.toString());
    }
  };
  
  // Handle publish
  const handlePublish = () => {
    publishAdMutation.mutate();
  };
  
  // Determine if we should show the launch button
  const showLaunchButton = currentStep === 3;

  // Render Step 3 layout with Distribution Summary & Ad Preview
  if (currentStep === 3) {
    return (
      <div className="container mx-auto px-4 py-6">
        {/* Auth Dialog */}
        <AuthDialog 
          isOpen={showAuthDialog} 
          onClose={handleCloseAuthDialog}
          onLoginSuccess={handleLoginSuccess}
          message="You need to sign in to publish your ad to Meta Ad Sets"
        />
        
        {/* Step 3 with Distribution Summary and Ad Preview */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Distribution Summary */}
          <div className="lg:w-1/2">
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <AdSummary 
                adName={`Ad for ${adData.brandName}`}
                onAdNameChange={(name) => {
                  // Update ad name if needed
                  console.log("Ad name updated:", name);
                  // Could save this to state/db if needed
                }}
                adAccountName={targetingData.adAccountId ? 
                  (targetingData.adAccountId === "account_1" ? "Meta Ads Account (Main)" : 
                  targetingData.adAccountId === "account_2" ? "Meta Ads Account (Secondary)" : 
                  targetingData.adAccountId) : 
                  undefined}
                campaigns={
                  // Get unique campaigns
                  Array.from(
                    new Set(
                      targetingData.adSets
                        .filter(adSet => adSet.campaignId)
                        .map(adSet => adSet.campaignId)
                    )
                  ).map(campaignId => {
                    // Convert campaign ID to name based on actual mapping in ad-targeting.tsx
                    let campaignName = "Campaign " + campaignId;
                    
                    // Account 1 campaigns
                    if (campaignId === "c1_1") campaignName = "Summer Sale 2025";
                    if (campaignId === "c1_2") campaignName = "Product Launch: Eco Series";
                    if (campaignId === "c1_3") campaignName = "Brand Awareness Q2";
                    
                    // Account 2 campaigns
                    if (campaignId === "c2_1") campaignName = "Winter Holiday Special";
                    if (campaignId === "c2_2") campaignName = "Lead Generation - Enterprise";
                    if (campaignId === "c2_3") campaignName = "Social Media Contest";
                    
                    return {
                      id: campaignId || "",
                      name: campaignName
                    };
                  })
                }
                adSets={targetingData.adSets.map(adSet => ({
                  id: adSet.id,
                  name: adSet.name,
                  campaignId: adSet.campaignId
                }))}
                facebookPage={adData.facebookPage}
                instagramAccount={adData.instagramAccount}
                allowMultiAdvertiserAds={targetingData.allowMultiAdvertiserAds}
                enableFlexibleMedia={targetingData.enableFlexibleMedia}
                advantagePlusEnhancements={targetingData.advantagePlusEnhancements}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevStep}
              >
                Back
              </Button>
              
              <Button
                onClick={handlePublish}
                disabled={publishAdMutation.isPending || !adData.mediaUrl || targetingData.adSets.length === 0}
                className="bg-[#f6242f] hover:opacity-90 text-white"
              >
                {publishAdMutation.isPending ? 
                  "Launching..." : 
                  `Launch to ${targetingData.adSets.length} Ad Set${targetingData.adSets.length !== 1 ? 's' : ''}`
                }
              </Button>
            </div>
          </div>
          
          {/* Right Column - Ad Preview */}
          <div className="lg:w-1/2">
            <AdPreview
              brandName={adData.brandName}
              mediaUrl={adData.mediaUrl}
              primaryText={adData.primaryText}
              websiteUrl={adData.websiteUrl}
              headline={adData.headline}
              description={adData.description}
              cta={adData.cta}
              storiesMediaUrl={placementMedia.stories}
              customizedPlacements={adData.customizePlacements}
              facebookPage={adData.facebookPage}
              instagramAccount={adData.instagramAccount}
            />
          </div>
        </div>
      </div>
    );
  }
  
  // Regular two-column layout for steps 1 and 2
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Auth Dialog */}
      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={handleCloseAuthDialog}
        onLoginSuccess={handleLoginSuccess}
        message="You need to sign in to publish your ad to Meta Ad Sets"
      />

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
                          className="bg-yellow-50 text-[#f6242f] hover:bg-yellow-100 border-yellow-200 h-7 ml-2"
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
                    <div className="bg-yellow-50 px-3 py-1.5 rounded-md flex items-center gap-1.5 ml-auto mb-1">
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
                        className="bg-yellow-50 text-[#f6242f] hover:bg-yellow-100 border-yellow-200 h-7 ml-2"
                        size="sm"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
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
                    // Convert to the format AdTargetingFormData expects
                    return { 
                      id: campaignId, 
                      name: "Campaign " + campaignId,
                      status: "ACTIVE" 
                    };
                  })
                  .filter((campaign, index, self) => 
                    // Remove duplicates
                    index === self.findIndex(c => c.id === campaign.id)
                  ),
                selectedAdSets: targetingData.adSets.map(adSet => ({
                  id: adSet.id,
                  name: adSet.name,
                  campaignId: adSet.campaignId || "",
                  status: "ACTIVE"
                })),
                facebookPageId: targetingData.facebookPageId || "",
                instagramAccountId: targetingData.instagramAccountId || "",
                allowMultiAdvertiserAds: targetingData.allowMultiAdvertiserAds === true,
                enableFlexibleMedia: targetingData.enableFlexibleMedia === true,
                // Use default values to avoid undefined properties
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
                  imageAnimation: false,
                  ...targetingData.advantagePlusEnhancements
                }
              }}
              onConnectionChange={setIsMetaConnected} 
              isConnected={isMetaConnected}
            />
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            {currentStep === 1 ? (
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={createAdMutation.isPending}
              >
                {createAdMutation.isPending ? "Saving..." : "Save Draft"}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handlePrevStep}
              >
                Back
              </Button>
            )}
            
            <div>
              <Button
                onClick={handleNextStep}
                disabled={
                  currentStep === 1 && !adData.mediaUrl ||
                  (currentStep === 2 && (
                    !isMetaConnected ||
                    !targetingData.adAccountId || 
                    targetingData.adSets.length === 0 || 
                    !targetingData.facebookPageId
                  ))
                }
                className={`${
                  (currentStep === 1 && !adData.mediaUrl) || 
                  (currentStep === 2 && (
                    !isMetaConnected ||
                    !targetingData.adAccountId || 
                    targetingData.adSets.length === 0 || 
                    !targetingData.facebookPageId
                  )) ? 
                  "bg-[#f6242f]/50 hover:bg-[#f6242f]/50 cursor-not-allowed" : 
                  "bg-[#f6242f] hover:opacity-90"
                } text-white`}
              >
                {currentStep === 1 ? "Create Ad" : "Launch"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Preview Panel */}
        <div className="lg:w-5/12">
          <AdPreview
            brandName={adData.brandName}
            mediaUrl={adData.mediaUrl}
            primaryText={adData.primaryText}
            websiteUrl={adData.websiteUrl}
            headline={adData.headline}
            description={adData.description}
            cta={adData.cta}
            storiesMediaUrl={placementMedia.stories}
            customizedPlacements={adData.customizePlacements}
            facebookPage={adData.facebookPage}
            instagramAccount={adData.instagramAccount}
          />
        </div>
      </div>
    </div>
  );
}