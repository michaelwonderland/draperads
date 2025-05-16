import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AdPreview } from "./ad-preview";
import { CheckCircle2, ArrowRight, Facebook, Instagram } from "lucide-react";

interface AdSummaryProps {
  adData: {
    templateId: number;
    adType: string;
    adFormat: string;
    mediaUrl: string;
    primaryText: string;
    headline: string;
    description?: string;
    cta: string;
    websiteUrl: string;
    brandName: string;
    facebookPage?: string;
    instagramAccount?: string;
    storiesMediaUrl?: string;
    customizePlacements?: boolean;
  };
  targetingData: {
    adAccountId: string;
    campaignObjective: string;
    adSets: any[];
    facebookPageId?: string;
    instagramAccountId?: string;
    facebookPageName?: string;
    instagramAccountName?: string;
  };
  onComplete: (email: string) => void;
  onBack: () => void;
}

export function AdSummary({ adData, targetingData, onComplete, onBack }: AdSummaryProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Format names properly
  const formatAdType = (type: string) => {
    const types: Record<string, string> = {
      'conversions': 'Conversions',
      'leads': 'Lead Generation',
      'traffic': 'Website Traffic',
      'awareness': 'Brand Awareness'
    };
    return types[type] || type;
  };
  
  const formatAdFormat = (format: string) => {
    const formats: Record<string, string> = {
      'image': 'Image Ad',
      'video': 'Video Ad',
      'carousel': 'Carousel Ad',
      'collection': 'Collection Ad'
    };
    return formats[format] || format;
  };
  
  const formatCTA = (cta: string) => {
    const ctas: Record<string, string> = {
      'learn_more': 'Learn More',
      'sign_up': 'Sign Up',
      'shop_now': 'Shop Now',
      'download': 'Download',
      'get_offer': 'Get Offer'
    };
    return ctas[cta] || cta;
  };
  
  const handleCreateAccount = () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call/account creation
    setTimeout(() => {
      onComplete(email);
      
      toast({
        title: "Account created!",
        description: "Your DraperAds account has been created and your ad is being processed.",
      });
      
      setIsSubmitting(false);
    }, 1500);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Ad Is Ready To Launch!</h1>
          <p className="text-gray-600">
            Review your ad details below and create your DraperAds account to publish
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Ad Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Ad Preview</h2>
            <div className="border rounded-lg overflow-hidden">
              <AdPreview
                brandName={adData.brandName}
                mediaUrl={adData.mediaUrl}
                primaryText={adData.primaryText}
                headline={adData.headline}
                description={adData.description}
                cta={adData.cta}
                websiteUrl={adData.websiteUrl}
                facebookPage={adData.facebookPage}
                instagramAccount={adData.instagramAccount}
                storiesMediaUrl={adData.storiesMediaUrl}
                customizedPlacements={adData.customizePlacements}
              />
            </div>
          </div>
          
          {/* Ad Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Ad Details</h2>
            <div className="space-y-6">
              {/* Design details */}
              <div className="space-y-3">
                <h3 className="text-md font-medium flex items-center">
                  <Badge className="mr-2 bg-[#f6242f]">1</Badge> Design
                </h3>
                <div className="ml-8 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand Name:</span>
                    <span className="font-medium">{adData.brandName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ad Type:</span>
                    <span className="font-medium">{formatAdType(adData.adType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ad Format:</span>
                    <span className="font-medium">{formatAdFormat(adData.adFormat)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Call to Action:</span>
                    <span className="font-medium">{formatCTA(adData.cta)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Website URL:</span>
                    <span className="font-medium text-blue-600 underline truncate max-w-[200px]">{adData.websiteUrl}</span>
                  </div>
                </div>
              </div>
              
              {/* Distribution details */}
              <div className="space-y-3">
                <h3 className="text-md font-medium flex items-center">
                  <Badge className="mr-2 bg-[#f6242f]">2</Badge> Distribution
                </h3>
                <div className="ml-8 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Campaign Objective:</span>
                    <span className="font-medium">{formatAdType(targetingData.campaignObjective || adData.adType)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ad Sets:</span>
                    <span className="font-medium">{targetingData.adSets.length} selected</span>
                  </div>
                  
                  {targetingData.adSets.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {targetingData.adSets.slice(0, 3).map((adSet, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-100">
                          {adSet.name}
                        </Badge>
                      ))}
                      {targetingData.adSets.length > 3 && (
                        <Badge variant="outline" className="bg-gray-100">
                          +{targetingData.adSets.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Brand Identity */}
                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-2">Brand Identity</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Facebook className="h-4 w-4 mr-2 text-[#1877F2]" />
                        <span className="text-gray-600 mr-2">Facebook Page:</span>
                        <span className="font-medium">
                          {adData.facebookPage || "Not selected"}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Instagram className="h-4 w-4 mr-2 text-[#E1306C]" />
                        <span className="text-gray-600 mr-2">Instagram Account:</span>
                        <span className="font-medium">
                          {adData.instagramAccount || "Not selected"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Account Creation */}
        <div className="max-w-md mx-auto border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Create your DraperAds Account</h2>
          <p className="text-gray-600 mb-4">
            Enter your email to create your account and start tracking your ad performance
          </p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateAccount}
                className="flex-1 bg-[#f6242f] hover:opacity-90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">Creating Account...</span>
                ) : (
                  <span className="flex items-center">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}