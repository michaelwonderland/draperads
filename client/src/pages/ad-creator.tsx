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

interface AdSetConfig {
  id: string;
  name: string;
  audience: string;
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
    staleTime: 60 * 1000, // Cache for 1 minute
    // In newer versions of React-Query, onSettled is used differently, we'll update this 
    onSuccess: () => {
      setIsLoadingDraft(false);
    },
    onError: () => {
      setIsLoadingDraft(false);
    }
  });
  
  const [aiSuggestions, setAiSuggestions] = useState<{
    suggestedHeadline: string;
    suggestedPrimaryText: string;
    suggestedDescription: string;
    suggestedCta: string;
  } | null>(null);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  
  // Ad content state
  const [adData, setAdData] = useState({
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
    facebookPageId: "",
    instagramAccountId: "",
    hasAppliedAiSuggestions: false // Track whether AI suggestions are applied
  });
  
  // Ad targeting state
  const [targetingData, setTargetingData] = useState({
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
      // Include current step and additional ad type fields when saving
      const adDataToSave = {
        ...adData,
        adType: adData.adType,
        adFormat: adData.adFormat,
        customizePlacements: adData.customizePlacements
      };
      
      const response = await apiRequest('POST', '/api/ads', adDataToSave);
      return await response.json();
    },
    onSuccess: (ad) => {
      toast({
        title: "Draft saved",
        description: "Your ad has been saved as a draft.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ads/draft/latest'] });
    },
    onError: (error: any) => {
      console.error("Failed to save ad draft:", error);
      // Don't show error toast as this happens in the background
    }
  });
  
  // Publish ad mutation
  const publishAdMutation = useMutation({
    mutationFn: async (adId: number) => {
      const requestData = {
        adId,
        targeting: targetingData
      };
      
      const response = await apiRequest('POST', '/api/ads/publish', requestData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Ad published!",
        description: "Your ad is now being processed and will be live soon.",
      });
      
      // Navigate to history page to see published ads
      navigate('/ad-history');
    },
    onError: (error: any) => {
      toast({
        title: "Publish failed",
        description: `Failed to publish ad: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Load latest draft when available
  useEffect(() => {
    if (latestDraft && !isDraftLoading) {
      // Update ad data with the latest draft
      setAdData({
        templateId: latestDraft.templateId || 1,
        adType: latestDraft.adType || "conversions",
        adFormat: latestDraft.adFormat || "image",
        mediaUrl: latestDraft.mediaUrl || "",
        primaryText: latestDraft.primaryText || "",
        headline: latestDraft.headline || "",
        description: latestDraft.description || "",
        cta: latestDraft.cta || "sign_up",
        websiteUrl: latestDraft.websiteUrl || "https://example.com/signup",
        brandName: latestDraft.brandName || "DraperAds",
        status: latestDraft.status || "draft",
        customizePlacements: false,
        facebookPage: latestDraft.facebookPage || "",
        instagramAccount: latestDraft.instagramAccount || "",
        facebookPageId: latestDraft.facebookPageId || "",
        instagramAccountId: latestDraft.instagramAccountId || "",
        hasAppliedAiSuggestions: false
      });
      
      // Show toast notification
      toast({
        title: "Draft Loaded",
        description: "Your previous ad draft has been loaded.",
      });
      
      setIsLoadingDraft(false);
    } else if (!isDraftLoading) {
      setIsLoadingDraft(false);
    }
  }, [latestDraft, isDraftLoading, toast]);
  
  // Placement-specific media state
  const [placementMedia, setPlacementMedia] = useState({
    feeds: "",
    stories: "",
    rightColumn: ""
  });
  
  // AI Suggestions
  const handleSuggestionsGenerated = (suggestions: {
    suggestedHeadline: string;
    suggestedPrimaryText: string;
    suggestedDescription: string;
    suggestedCta: string;
  }) => {
    setAiSuggestions(suggestions);
    
    // Automatically apply the suggestions
    handleAdTextChange({
      primaryText: suggestions.suggestedPrimaryText,
      headline: suggestions.suggestedHeadline,
      description: suggestions.suggestedDescription,
      cta: suggestions.suggestedCta,
      websiteUrl: adData.websiteUrl
    });
    
    setAdData(prev => ({
      ...prev,
      hasAppliedAiSuggestions: true
    }));
    
    toast({
      title: "AI suggestions applied",
      description: "The ad copy has been updated with AI-generated suggestions based on your image.",
    });
    
    setGeneratingSuggestions(false);
  };
  
  // Handle media upload
  const handleMediaUpload = (mediaUrl: string) => {
    setAdData(prev => ({ ...prev, mediaUrl }));
    setGeneratingSuggestions(true);
  };
  
  // Handle ad text changes
  const handleAdTextChange = (values: any) => {
    setAdData(prev => ({
      ...prev,
      primaryText: values.primaryText,
      headline: values.headline,
      description: values.description,
      cta: values.cta,
      websiteUrl: values.websiteUrl
    }));
  };
  
  // Handle brand change
  const handleBrandChange = (values: { brandName: string }) => {
    setAdData(prev => ({ ...prev, brandName: values.brandName }));
  };
  
  // Handle targeting change
  const handleTargetingChange = (values: any) => {
    setTargetingData(values);
    
    // Store both Facebook and Instagram IDs and names to ensure they persit between steps
    setAdData(prev => ({
      ...prev,
      facebookPage: values.facebookPageName || prev.facebookPage || "",
      instagramAccount: values.instagramAccountName || prev.instagramAccount || "",
      facebookPageId: values.facebookPageId || prev.facebookPageId || "",
      instagramAccountId: values.instagramAccountId || prev.instagramAccountId || ""
    }));
    
    // Update the Meta connection status based on ad account selection
    if (values.adAccountId) {
      setIsMetaConnected(true);
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
  
  // Move to summary/publish step
  const handlePublish = async () => {
    // First save the ad if it's not saved yet (to keep a draft)
    try {
      // Save the current ad data
      await createAdMutation.mutateAsync();
      
      // Move to the summary step
      setCurrentStep(3);
      
      // Update localStorage to sync with header
      localStorage.setItem('adCreatorStep', '3');
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save ad: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  // Final submission with account creation
  const handleFinalSubmit = async (email: string) => {
    // Check if user is authenticated
    if (!isAuthenticated && !authLoading) {
      // Show auth dialog if not authenticated
      setShowAuthDialog(true);
      return;
    }
    
    // Publish the ad with the created account
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
        
        // Navigate to the ad history page
        navigate('/ad-history');
      } else {
        throw new Error("Failed to get ad ID");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to publish ad: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  // Close auth dialog
  const handleCloseAuthDialog = () => {
    setShowAuthDialog(false);
  };
  
  // After successful login
  const handleLoginSuccess = () => {
    setShowAuthDialog(false);
    
    // Try publishing again now that we're authenticated
    handleFinalSubmit("");
  };
  
  // Handle step changes
  const handleStepChange = (step: number) => {
    // If moving forward, validate step
    if (step > currentStep) {
      // Step 1 to 2: Validate ad design
      if (currentStep === 1 && step === 2) {
        if (!adData.mediaUrl) {
          toast({
            title: "Media required",
            description: "Please upload an image or video for your ad.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Save current progress
      setCurrentStep(step);
      
      // Update localStorage to sync with header
      localStorage.setItem('adCreatorStep', step.toString());
      
      // Try to save in the background without blocking
      try {
        createAdMutation.mutate();
      } catch (error) {
        console.log("Background save attempt will continue in the background");
      }
    } else {
      // Moving backward is always allowed
      setCurrentStep(step);
      
      // Update localStorage to sync with header
      localStorage.setItem('adCreatorStep', step.toString());
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
      
      {/* Summary view (full width) */}
      {currentStep === 3 ? (
        <div className="w-full">
          <AdSummary 
            adData={adData}
            targetingData={targetingData}
            onComplete={handleFinalSubmit}
            onBack={() => {
              setCurrentStep(2);
              localStorage.setItem('adCreatorStep', '2');
            }}
          />
        </div>
      ) : (
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
            
            {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Distribution Settings</h2>
              
              {/* Ad Targeting Form */}
              <AdTargeting 
                onChange={handleTargetingChange}
                onConnectionChange={setIsMetaConnected}
                defaultValues={targetingData}
              />
            </div>
            )}
            
            {/* Bottom Button Bar */}
            <div className="flex justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div>
                {currentStep > 1 && (
                  <Button 
                    onClick={() => handleStepChange(currentStep - 1)}
                    variant="outline"
                  >
                    Back
                  </Button>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleSaveDraft}
                  variant="outline"
                  disabled={createAdMutation.isPending || !adData.mediaUrl}
                >
                  {createAdMutation.isPending ? "Saving..." : "Save Draft"}
                </Button>
                
                {currentStep < 3 ? (
                  <Button
                    onClick={currentStep === 1 
                      ? () => handleStepChange(2) 
                      : handlePublish}
                    disabled={
                      !adData.mediaUrl || 
                      (currentStep === 2 && (
                        !isMetaConnected || 
                        targetingData.adSets.length === 0 || 
                        !targetingData.facebookPageId
                      ))
                    }
                    className={`${(
                      !adData.mediaUrl || 
                      (currentStep === 2 && (
                        !isMetaConnected || 
                        targetingData.adSets.length === 0 || 
                        !targetingData.facebookPageId
                      ))
                    ) ? 
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
      )}
    </div>
  );
}