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
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  
  // Fetch latest draft ad when component mounts
  const { data: latestDraft, isLoading: isDraftLoading } = useQuery({
    queryKey: ['/api/ads/draft/latest'],
    enabled: true,
    retry: false, // Don't retry if no draft is found
    staleTime: 60 * 1000, // Cache for 1 minute
    onSettled: () => {
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
        facebookPage: "",
        instagramAccount: "",
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
    hasAppliedAiSuggestions: false // Track whether AI suggestions are applied
  });
  
  // Ad targeting state
  const [targetingData, setTargetingData] = useState({
    adAccountId: "account_1",
    campaignObjective: "traffic",
    placements: ["facebook", "instagram"],
    adSets: [
      { id: "set1", name: "Main Audience", audience: "Broad - 25-54 age range" }
    ]
  });
  
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
            campaignObjective: targetingData.campaignObjective,
            placements: targetingData.placements,
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
    
    // Store the suggestions but don't apply them immediately
    setTimeout(() => {
      setAiSuggestions(suggestions);
      setGeneratingSuggestions(false);
      
      // Don't auto-apply suggestions immediately, let user click the button
      // Old behavior was to auto-apply:
      /*
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
        title: "AI Suggestions Applied",
        description: "Ad copy has been updated based on your image",
      });
      */
    }, 2000); // Show generating for 2 seconds to make it more visible
  };
  
  // Handle template selection
  const handleTemplateSelect = (templateId: number) => {
    setAdData(prev => ({ ...prev, templateId }));
  };
  
  // Handle ad text form submission
  const handleAdTextChange = (values: any) => {
    setAdData(prev => ({ ...prev, ...values }));
  };
  
  // Handle brand settings change
  const handleBrandChange = (values: { brandName: string }) => {
    setAdData(prev => ({ ...prev, brandName: values.brandName }));
  };
  
  // Handle ad type and format change - these are now handled directly in the component
  
  // Handle targeting change
  const handleTargetingChange = (values: any) => {
    setTargetingData(values);
  };
  
  // Save draft
  const handleSaveDraft = async () => {
    createAdMutation.mutate();
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
      // Save current progress before moving to next step
      try {
        await createAdMutation.mutateAsync();
        // After successful save, move to next step
        setCurrentStep(currentStep + 1);
      } catch (error) {
        // Even if save fails, we still move to the next step
        console.error("Failed to save progress:", error);
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // Handle previous step
  const handlePrevStep = async () => {
    if (currentStep > 1) {
      // Save current progress before moving to previous step
      try {
        await createAdMutation.mutateAsync();
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
      // Move to previous step regardless of save success
      setCurrentStep(currentStep - 1);
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
                  
                  <div className="h-9 flex items-center gap-3">
                    {generatingSuggestions && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 flex items-center gap-1 h-9 px-3">
                        <Sparkles className="h-3 w-3 mr-1" /> 
                        Generating AI suggestions...
                      </Badge>
                    )}
                    
                    {!generatingSuggestions && aiSuggestions && (
                      <div className="flex items-center gap-3">
                        {adData.hasAppliedAiSuggestions ? (
                          <>
                            <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1 h-9 px-3">
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
                            className="bg-yellow-50 text-[#f6242f] hover:bg-yellow-100 border-yellow-200 flex items-center gap-1 h-9 px-3"
                          >
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                              <path d="M7.5 0.5C3.35786 0.5 0 3.85786 0 8C0 12.1421 3.35786 15.5 7.5 15.5C11.6421 15.5 15 12.1421 15 8C15 3.85786 11.6421 0.5 7.5 0.5ZM8.5 6.5C8.5 5.94772 8.05228 5.5 7.5 5.5C6.94772 5.5 6.5 5.94772 6.5 6.5V10.5C6.5 11.0523 6.94772 11.5 7.5 11.5C8.05228 11.5 8.5 11.0523 8.5 10.5V6.5ZM7.5 3C6.94772 3 6.5 3.44772 6.5 4C6.5 4.55228 6.94772 5 7.5 5C8.05228 5 8.5 4.55228 8.5 4C8.5 3.44772 8.05228 3 7.5 3Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                            Apply AI Suggestions
                          </Button>
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
            <AdTargeting onChange={handleTargetingChange} defaultValues={targetingData} />
          )}

          {/* Launch Preview - Step 3 */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Launch Preview</h2>
              <p className="text-sm text-[#65676B] mb-6">
                Review your ad creative and distribution settings before launching.
              </p>
              
              <div className="border border-[#E4E6EB] rounded-md p-4 mb-4">
                <h3 className="font-medium mb-2">Ad Creative</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-[#65676B]">Brand:</div>
                  <div>{adData.brandName}</div>
                  <div className="text-[#65676B]">Headline:</div>
                  <div>{adData.headline}</div>
                  <div className="text-[#65676B]">Media:</div>
                  <div>{adData.mediaUrl ? "✓ Uploaded" : "No media"}</div>
                </div>
              </div>
              
              <div className="border border-[#E4E6EB] rounded-md p-4 mb-6">
                <h3 className="font-medium mb-2">Distribution</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-[#65676B]">Campaign objective:</div>
                  <div className="capitalize">{targetingData.campaignObjective}</div>
                  <div className="text-[#65676B]">Placements:</div>
                  <div>{targetingData.placements.join(', ')}</div>
                  <div className="text-[#65676B]">Ad Sets:</div>
                  <div>{targetingData.adSets.length}</div>
                </div>
              </div>

              <div className="border border-[#E4E6EB] rounded-md p-4 mb-6">
                <h3 className="font-medium mb-2">Ad Sets ({targetingData.adSets.length})</h3>
                <div className="space-y-3">
                  {targetingData.adSets.map((adSet, index) => (
                    <div key={adSet.id} className="border-b border-[#E4E6EB] last:border-0 pb-2 last:pb-0">
                      <div className="font-medium">{adSet.name}</div>
                      <div className="text-sm text-[#65676B]">Audience: {adSet.audience}</div>
                    </div>
                  ))}
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
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
              ) : null}
              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={currentStep === 1 && !adData.mediaUrl}
                  className="bg-[#f6242f] hover:opacity-90 text-white"
                >
                  Create Ad
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
          />
        </div>
      </div>
    </div>
  );
}
