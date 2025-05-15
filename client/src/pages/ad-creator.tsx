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

export default function AdCreator() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Ad content state
  const [adData, setAdData] = useState({
    templateId: 1,
    mediaUrl: "",
    primaryText: "Transform your social media presence with our AI-powered design tools. No design skills needed!",
    headline: "Create stunning ads in minutes!",
    description: "No design skills needed. Try it today!",
    cta: "sign_up",
    websiteUrl: "https://example.com/signup",
    brandName: "AdCreator",
    brandLogoUrl: "",
    status: "draft"
  });
  
  // Ad targeting state
  const [targetingData, setTargetingData] = useState({
    adAccountId: "account_1",
    campaignObjective: "traffic",
    placements: ["facebook", "instagram"]
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
        description: "Your ad has been saved as a draft.",
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
      const publishData = {
        adId,
        adSetData: {
          name: `Ad Set for ${adData.headline}`,
          accountId: targetingData.adAccountId.replace('account_', ''),
          campaignObjective: targetingData.campaignObjective,
          placements: targetingData.placements,
          adId,
        }
      };
      return await apiRequest('POST', '/api/publish', publishData);
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Your ad has been published to Meta.",
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
      publishAdMutation.mutate(response.id);
    } else {
      const adId = createAdMutation.data.id;
      publishAdMutation.mutate(adId);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Editor Panel */}
        <div className="lg:w-7/12">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">Create Ad</h2>
            
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
          
          {/* Ad Targeting */}
          <AdTargeting onChange={handleTargetingChange} />
          
          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={createAdMutation.isPending}
            >
              {createAdMutation.isPending ? "Saving..." : "Save Draft"}
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                Back
              </Button>
              <Button
                onClick={handlePublish}
                disabled={publishAdMutation.isPending || !adData.mediaUrl}
                className="bg-[#1877F2] hover:bg-blue-600"
              >
                {publishAdMutation.isPending ? "Publishing..." : "Publish Ad"}
              </Button>
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
