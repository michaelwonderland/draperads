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
  const [currentStep, setCurrentStep] = useState(1);
  
  // Ad content state
  const [adData, setAdData] = useState({
    templateId: 1,
    mediaUrl: "",
    primaryText: "Transform your social media presence with our AI-powered design tools. No design skills needed!",
    headline: "Create stunning ads in minutes!",
    description: "No design skills needed. Try it today!",
    cta: "sign_up",
    websiteUrl: "https://example.com/signup",
    brandName: "AdPotion",
    brandLogoUrl: "",
    status: "draft"
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
      return await apiRequest('POST', '/api/ads', adData);
    },
    onSuccess: async (response) => {
      const ad = await response.json();
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
      
      return Promise.all(promises);
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: `Your ad has been published to ${targetingData.adSets.length} ad sets.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      navigate('/history');
    },
    onError: (error) => {
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
    // First save the ad if it's not saved yet
    if (!createAdMutation.data) {
      const response = await createAdMutation.mutateAsync();
      const adData = await response.json();
      publishAdMutation.mutate(adData.id);
    } else {
      const adData = createAdMutation.data;
      publishAdMutation.mutate(adData.id);
    }
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
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Editor Panel */}
        <div className="lg:w-7/12">
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Design Your Ad</h2>
              
              {/* Media Uploader */}
              <MediaUploader 
                onMediaUpload={handleMediaUpload} 
                value={adData.mediaUrl}
              />
              
              {/* Template Selector */}
              <TemplateSelector 
                onTemplateSelect={handleTemplateSelect}
                selectedTemplateId={adData.templateId}
              />
              
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
              
              {/* Brand Settings */}
              <BrandSettings 
                onBrandChange={handleBrandChange}
                brandName={adData.brandName}
                brandLogoUrl={adData.brandLogoUrl}
              />
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={publishAdMutation.isPending || !adData.mediaUrl || targetingData.adSets.length === 0}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
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
