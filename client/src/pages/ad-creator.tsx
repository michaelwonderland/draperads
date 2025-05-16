import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
    brandLogoUrl: "",
    status: "draft",
    customizePlacements: false, // Whether to use different creatives for different placements
    facebookPage: "",
    instagramAccount: ""
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
  
  // Create ad mutation
  const createAdMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ads', adData);
      return await response.json();
    },
    onSuccess: (ad) => {
      toast({
        title: "Success",
        description: "Your ad creative has been saved as a draft.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
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
  
  // Handle template selection
  const handleTemplateSelect = (templateId: number) => {
    setAdData(prev => ({ ...prev, templateId }));
  };
  
  // Handle ad text form submission
  const handleAdTextChange = (values: any) => {
    setAdData(prev => ({ ...prev, ...values }));
  };
  
  // Handle brand settings change
  const handleBrandChange = (values: { brandName: string; brandLogoUrl?: string }) => {
    setAdData(prev => ({ ...prev, ...values }));
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
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
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
                  value={adData.mediaUrl}
                />
                
                {/* Placement Customizer - only shown after media upload */}
                <PlacementCustomizer
                  mediaUrl={adData.mediaUrl}
                  enabled={adData.customizePlacements}
                  onToggleCustomization={(enabled) => setAdData(prev => ({ ...prev, customizePlacements: enabled }))}
                />
                
                {/* Template Selector - Removed as it's now combined with the Ad Type */}
              </div>
              
              <div className="border-t pt-8 mb-8">
                <h3 className="text-lg font-medium mb-6">Ad Copy</h3>
                
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
                  brandLogoUrl={adData.brandLogoUrl}
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
                  Next Step
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
            brandLogoUrl={adData.brandLogoUrl}
            mediaUrl={adData.mediaUrl}
            primaryText={adData.primaryText}
            headline={adData.headline}
            description={adData.description}
            cta={adData.cta}
          />
        </div>
      </div>
    </div>
  );
}
