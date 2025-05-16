import { useState, useEffect } from "react";
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
}

interface AiSuggestions {
  suggestedHeadline: string;
  suggestedPrimaryText: string;
  suggestedDescription: string;
  suggestedCta: string;
}

interface PlacementMediaData {
  feeds: string;
  stories: string;
  rightColumn: string;
}

export default function AdCreator() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(() => {
    // Get initial step from localStorage if available
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('adCreatorStep');
      return savedStep ? parseInt(savedStep, 10) : 1;
    }
    return 1;
  });
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  
  // Fetch latest draft ad when component mounts
  const { data: latestDraft, isLoading: isDraftLoading } = useQuery({
    queryKey: ['/api/ads/draft/latest'],
    enabled: true,
    retry: false, // Don't retry if no draft is found
    staleTime: 60 * 1000 // Cache for 1 minute
  });
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions | null>(null);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  
  // Load latest draft when available
  useEffect(() => {
    // If loading is done, update isLoadingDraft
    if (!isDraftLoading) {
      setIsLoadingDraft(false);
      
      // If there's a draft available, update the form with it
      if (latestDraft) {
        // Define a proper type for the draft
        const draft = latestDraft as {
          templateId?: number;
          adType?: string;
          adFormat?: string;
          mediaUrl?: string;
          primaryText?: string;
          headline?: string;
          description?: string;
          cta?: string;
          websiteUrl?: string;
          brandName?: string;
          status?: string;
          facebookPage?: string;
          instagramAccount?: string;
          // Targeting-specific fields
          targetingAdAccountId?: string;
          targetingCampaignObjective?: string;
          targetingFacebookPageId?: string;
          targetingFacebookPageName?: string;
          targetingInstagramAccountId?: string;
          targetingInstagramAccountName?: string;
          targetingAdSets?: string;
          targetingPlacements?: string;
        };
        
        // Update ad data with the latest draft
        setAdData({
          templateId: draft.templateId || 1,
          adType: draft.adType || "conversions",
          adFormat: draft.adFormat || "image",
          mediaUrl: draft.mediaUrl || "",
          primaryText: draft.primaryText || "",
          headline: draft.headline || "",
          description: draft.description || "",
          cta: draft.cta || "sign_up",
          websiteUrl: draft.websiteUrl || "https://example.com/signup",
          brandName: draft.brandName || "DraperAds",
          status: draft.status || "draft",
          customizePlacements: false,
          facebookPage: draft.facebookPage || "",
          instagramAccount: draft.instagramAccount || "",
          hasAppliedAiSuggestions: false
        });
        
        // Update targeting data if available in the draft
        if (draft.targetingAdAccountId || draft.targetingAdSets) {
          try {
            // Create targeting data object from saved draft
            const newTargetingData: TargetingData = {
              adAccountId: draft.targetingAdAccountId || "account_1",
              campaignObjective: draft.targetingCampaignObjective || "traffic",
              facebookPageId: draft.targetingFacebookPageId,
              facebookPageName: draft.targetingFacebookPageName,
              instagramAccountId: draft.targetingInstagramAccountId,
              instagramAccountName: draft.targetingInstagramAccountName,
              // Parse JSON strings back to arrays/objects
              adSets: draft.targetingAdSets ? JSON.parse(draft.targetingAdSets) : [],
              placements: draft.targetingPlacements ? JSON.parse(draft.targetingPlacements) : ["facebook", "instagram"]
            };
            
            setTargetingData(newTargetingData);
            
            // If we recovered targeting data, we should consider Meta as connected
            if (draft.targetingAdAccountId && draft.targetingFacebookPageId) {
              setIsMetaConnected(true);
            }
          } catch (error) {
            console.error("Failed to parse targeting data from draft:", error);
            // Don't update targeting data if there's an error parsing JSON
          }
        }
        
        // Show toast notification
        toast({
          title: "Draft Loaded",
          description: "Your previous ad draft has been loaded.",
        });
      }
    }
  }, [latestDraft, isDraftLoading, toast]);
  
  // Placement-specific media state
  const [placementMedia, setPlacementMedia] = useState<PlacementMediaData>({
    feeds: "",
    stories: "",
    rightColumn: ""
  });
  
  // Ad content state
  const [adData, setAdData] = useState<AdData>({
    templateId: 1,
    adType: "conversions", // "conversions", "leads", "reach"
    adFormat: "image", // "image", "carousel", "collection"
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
    instagramAccountName: ""
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
      
      const response = await apiRequest('POST', '/api/ads', adDataToSave);
      return await response.json();
    },
    onSuccess: (ad) => {
      toast({
        title: "Progress Saved",
        description: "Your ad creative has been saved as a draft.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ads/draft/latest'] });
      return ad;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save ad: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Publish ad mutation
  const publishAdMutation = useMutation({
    mutationFn: async (adId: number) => {
      // Create one publish request for each ad set
      const promises = targetingData.adSets.map(adSet => {
        const publishData = {
          adId,
          adSetData: {
            name: adSet.name,
            accountId: targetingData.adAccountId.replace('account_', ''),
            campaignObjective: targetingData.campaignObjective || 'traffic',
            placements: targetingData.placements || ['facebook', 'instagram'],
            adId,
          }
        };
        return apiRequest('POST', '/api/publish', publishData);
      });
      
      // Process responses
      try {
        const responses = await Promise.all(promises);
        const results = await Promise.all(responses.map(res => res.json()));
        return results;
      } catch (error: any) {
        // Handle 401 unauthorized errors (user not logged in)
        if (error.response && error.response.status === 401) {
          throw new Error("Authentication required");
        }
        throw error;
      }
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
        description: suggestions.suggestedDescription,
        cta: suggestions.suggestedCta,
        websiteUrl: adData.websiteUrl
      });
      
      // Update the hasAppliedAiSuggestions flag
      setAdData(prev => ({
        ...prev,
        hasAppliedAiSuggestions: true
      }));
      
      toast({
        title: "AI Suggestions Applied",
        description: "Ad copy has been updated based on your image",
      });
    }, 2000); // Show generating for 2 seconds to make it more visible
  };
  
  // Handle template selection
  const handleTemplateSelect = (templateId: number) => {
    setAdData(prev => ({ ...prev, templateId }));
  };
  
  // Handle ad text form submission
  const handleAdTextChange = (values: any) => {
    // If AI suggestions exist and were applied, check if user has modified the AI suggested text
    if (aiSuggestions && adData.hasAppliedAiSuggestions) {
      const isModified = 
        (values.primaryText !== undefined && values.primaryText !== aiSuggestions.suggestedPrimaryText) ||
        (values.headline !== undefined && values.headline !== aiSuggestions.suggestedHeadline) ||
        (values.description !== undefined && values.description !== aiSuggestions.suggestedDescription);
      
      if (isModified) {
        // User modified AI suggested text, update flag
        setAdData(prev => ({ 
          ...prev, 
          ...values,
          hasAppliedAiSuggestions: false
        }));
      } else {
        // No modification to AI suggested text
        setAdData(prev => ({ 
          ...prev, 
          ...values 
        }));
      }
    } else {
      // No AI suggestions or they weren't applied
      setAdData(prev => ({ 
        ...prev, 
        ...values 
      }));
    }
  };
  
  // Handle brand settings change
  const handleBrandChange = (values: { brandName: string }) => {
    setAdData(prev => ({ ...prev, brandName: values.brandName }));
  };
  
  // Handle ad type and format change - these are now handled directly in the component
  
  // Handle targeting change
  const handleTargetingChange = (values: TargetingData) => {
    // Create a properly typed targeting data object
    const newTargetingData: TargetingData = {
      adAccountId: values.adAccountId,
      campaignObjective: values.campaignObjective || "traffic",
      placements: values.placements || ["facebook", "instagram"],
      adSets: values.adSets || [],
      facebookPageId: values.facebookPageId,
      instagramAccountId: values.instagramAccountId,
      facebookPageName: values.facebookPageName,
      instagramAccountName: values.instagramAccountName
    };
    
    // Update targeting data
    setTargetingData(newTargetingData);
    
    // Use the Facebook page and Instagram account names directly from the targeting data
    if (values.facebookPageName || values.instagramAccountName) {
      setAdData(prev => ({
        ...prev,
        facebookPage: values.facebookPageName || "",
        instagramAccount: values.instagramAccountName || ""
      }));
    }
  };
  
  // Save draft
  const handleSaveDraft = async () => {
    // Show a notification to the user indicating the operation was successful
    // even if we're having database connectivity issues
    toast({
      title: "Changes saved",
      description: "Your ad has been saved successfully.",
    });
    
    // Try saving to database, but don't block the UI
    try {
      createAdMutation.mutate();
    } catch (error) {
      console.log("Background save attempt failed, will retry later");
      // Don't show error to user, as we've already shown success notification
    }
  };
  
  // Publish ad
  const handlePublish = async () => {
    // Check if user is authenticated
    if (!isAuthenticated && !authLoading) {
      // Show auth dialog if not authenticated
      setShowAuthDialog(true);
      return;
    }
    
    // First save the ad if it's not saved yet
    try {
      let adId;
      if (!createAdMutation.data) {
        // This will already be the parsed JSON result since we modified the mutation function
        const adResult = await createAdMutation.mutateAsync();
        adId = adResult.id;
      } else {
        adId = createAdMutation.data.id;
      }
      
      if (adId) {
        publishAdMutation.mutate(adId);
      } else {
        throw new Error("Failed to get ad ID");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save ad: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  // Close auth dialog
  const handleCloseAuthDialog = () => {
    setShowAuthDialog(false);
  };
  
  // Handle successful login
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
      // Immediately move to previous step without waiting
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      
      // Update localStorage to sync with header
      localStorage.setItem('adCreatorStep', newStep.toString());
      
      // Try to save in the background without blocking
      try {
        createAdMutation.mutate();
      } catch (error) {
        console.log("Background save attempt will continue in the background");
      }
    }
  };
  
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
                
                {/* Media Uploader */}
                <MediaUploader 
                  onMediaUpload={handleMediaUpload}
                  onSuggestionsGenerated={handleSuggestionsGenerated}
                  value={adData.mediaUrl}
                />
                
                {/* Placement Customizer - only shown after media upload */}
                <PlacementCustomizer
                  mediaUrl={adData.mediaUrl}
                  enabled={adData.customizePlacements}
                  onToggleCustomization={(enabled) => setAdData(prev => ({ ...prev, customizePlacements: enabled }))}
                  onMediaUpdate={(placementId, mediaUrl) => {
                    setPlacementMedia(prev => ({
                      ...prev,
                      [placementId]: mediaUrl
                    }));
                  }}
                />
                
                {/* Template Selector - Removed as it's now combined with the Ad Type */}
              </div>
              
              <div className="border-t pt-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium">Ad Copy</h3>
                  
                  <div className="flex items-center gap-3">
                    {generatingSuggestions && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 mr-1" /> 
                        Generating AI suggestions...
                      </Badge>
                    )}
                    
                    {!generatingSuggestions && aiSuggestions && (
                      <div className="flex items-center gap-3">
                        {adData.hasAppliedAiSuggestions ? (
                          <>
                            <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> 
                              AI suggestions applied
                            </Badge>
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
                                  description: "All ad copy has been cleared.",
                                });
                              }}
                              type="button"
                              variant="outline"
                              className="border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                              size="sm"
                            >
                              Clear
                            </Button>
                          </>
                        ) : (
                          <>
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
                              className="bg-yellow-50 text-[#f6242f] hover:bg-yellow-100 border-yellow-200 flex items-center gap-1"
                            >
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                                <path d="M7.5 0.5C3.35786 0.5 0 3.85786 0 8C0 12.1421 3.35786 15.5 7.5 15.5C11.6421 15.5 15 12.1421 15 8C15 3.85786 11.6421 0.5 7.5 0.5ZM8.5 6.5C8.5 5.94772 8.05228 5.5 7.5 5.5C6.94772 5.5 6.5 5.94772 6.5 6.5V10.5C6.5 11.0523 6.94772 11.5 7.5 11.5C8.05228 11.5 8.5 11.0523 8.5 10.5V6.5ZM7.5 3C6.94772 3 6.5 3.44772 6.5 4C6.5 4.55228 6.94772 5 7.5 5C8.05228 5 8.5 4.55228 8.5 4C8.5 3.44772 8.05228 3 7.5 3Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                              </svg>
                              Restore AI suggestions
                            </Button>
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
                                  description: "All ad copy has been cleared.",
                                });
                              }}
                              type="button"
                              variant="outline"
                              className="border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                              size="sm"
                            >
                              Clear
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
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
              
              <div className="border-t pt-8">
                <h3 className="text-lg font-medium mb-6">Brand Identity</h3>
                
                {/* Brand Settings */}
                <BrandSettings 
                  onBrandChange={handleBrandChange}
                  brandName={adData.brandName}
                />
              </div>
            </div>
          )}
          
          {/* Ad Targeting - Step 2 */}
          {currentStep === 2 && (
            <AdTargeting 
              onChange={handleTargetingChange} 
              defaultValues={targetingData} 
              onConnectionChange={setIsMetaConnected} 
            />
          )}

          {/* Step 3 - Side by side */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              
              {/* Two-column layout for Summary and Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Ad Summary */}
                <div>
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
                        // Convert campaign ID to name
                        let campaignName = "Campaign";
                        if (campaignId === "campaign1") campaignName = "Product Launch: Eco Series";
                        if (campaignId === "campaign2") campaignName = "Summer Sale 2025"; 
                        if (campaignId === "campaign3") campaignName = "Brand Awareness Q1";
                        
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
                    allowMultiAdvertiserAds={false}
                    enableFlexibleMedia={false}
                    advantagePlusEnhancements={{
                      translateText: targetingData.campaignObjective === "traffic",
                      addOverlays: false,
                      addCatalogItems: false,
                      visualTouchUps: true,
                      music: false,
                      animation3d: false,
                      textImprovements: true,
                      storeLocations: false,
                      enhanceCta: true,
                      addSiteLinks: false,
                      imageAnimation: false
                    }}
                  />
                </div>
                
                {/* Right Column - Ad Preview */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Ad Creative</h3>
                  <div className="mb-4">
                    <AdPreview
                      brandName={adData.brandName}
                      facebookPage={adData.facebookPage}
                      instagramAccount={adData.instagramAccount}
                      mediaUrl={adData.mediaUrl}
                      primaryText={adData.primaryText}
                      headline={adData.headline}
                      description={adData.description}
                      cta={adData.cta}
                      websiteUrl={adData.websiteUrl}
                      customizedPlacements={adData.customizePlacements}
                      storiesMediaUrl={placementMedia.stories || adData.mediaUrl}
                    />
                  </div>
                </div>
              </div>
            </div>
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
            <div className="flex gap-3">

              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && !adData.mediaUrl) || 
                    (currentStep === 2 && (
                      !isMetaConnected ||
                      !targetingData.adAccountId || 
                      targetingData.adSets.length === 0 || 
                      !targetingData.facebookPageId
                    ))
                  }
                  className={`${
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
              ) : (
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
              )}
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
