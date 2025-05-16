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
    facebookPageId?: string;
    instagramAccountId?: string;
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
            Review your distribution details below and create your DraperAds account to publish
          </p>
        </div>
        
        <div className="flex flex-col gap-8 mb-6">
          {/* Ad Preview - Smaller (50% of original size) */}
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-center">Ad Preview</h2>
            <div className="border rounded-lg overflow-hidden mx-auto transform scale-75 origin-top">
              <AdPreview
                brandName={adData.brandName}
                mediaUrl={adData.mediaUrl}
                primaryText={adData.primaryText}
                headline={adData.headline}
                description={adData.description}
                cta={adData.cta}
                websiteUrl={adData.websiteUrl}
                facebookPage={targetingData.facebookPageName || adData.facebookPage}
                instagramAccount={targetingData.instagramAccountName || adData.instagramAccount}
                storiesMediaUrl={adData.storiesMediaUrl}
                customizedPlacements={adData.customizePlacements}
              />
            </div>
          </div>
          
          {/* Distribution Details - Clear listing of selected items */}
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">Distribution Details</h2>
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
              {/* Meta Account Info */}
              <div className="mb-5 pb-5 border-b border-gray-200">
                <h3 className="text-base font-medium mb-3">Meta Ad Account</h3>
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <Facebook className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{targetingData.adAccountId ? "Connected" : "Not Connected"}</p>
                    {targetingData.adAccountId && (
                      <p className="text-sm text-gray-500">Account ID: {targetingData.adAccountId}</p>
                    )}
                  </div>
                </div>
              </div>
                
              {/* Brand Identity */}
              <div className="mb-5 pb-5 border-b border-gray-200">
                <h3 className="text-base font-medium mb-3">Brand Identity</h3>
                <div className="space-y-3">
                  {/* Facebook Page */}
                  <div className="flex items-center">
                    <div className="rounded-full bg-blue-100 p-2 mr-3">
                      <Facebook className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {targetingData.facebookPageName || adData.facebookPage || "No Facebook Page Selected"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Instagram Account */}
                  <div className="flex items-center">
                    <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-2 mr-3">
                      <Instagram className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {targetingData.instagramAccountName || adData.instagramAccount || "No Instagram Account Selected"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
                
              {/* Campaign */}
              <div className="mb-5 pb-5 border-b border-gray-200">
                <h3 className="text-base font-medium mb-3">Campaign</h3>
                <Badge variant="outline" className="bg-white border-blue-200 text-blue-800 px-3 py-1">
                  {formatAdType(targetingData.campaignObjective || adData.adType)} Campaign
                </Badge>
              </div>
                
              {/* Ad Sets - Detailed list */}
              <div>
                <h3 className="text-base font-medium mb-3">Ad Sets</h3>
                {targetingData.adSets && targetingData.adSets.length > 0 ? (
                  <div className="space-y-2">
                    {targetingData.adSets.map((adSet: any, index: number) => (
                      <div key={index} className="flex items-center bg-white p-3 rounded-md border border-gray-200">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                        <span>{adSet.name}</span>
                        {adSet.audience && (
                          <span className="ml-auto text-xs text-gray-500">{adSet.audience}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md border border-yellow-200">
                    <p>No ad sets selected. Please go back and select at least one ad set.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Account Creation Notice */}
        <div className="max-w-lg mx-auto mb-4">
          <div className="bg-[#FFF8F8] border border-[#FFCDD2] rounded-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#f6242f]"></div>
            
            <div className="flex items-start">
              <div className="bg-[#FFEBEE] p-2 rounded-full mr-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#f6242f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V12" stroke="#f6242f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16H12.01" stroke="#f6242f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <div>
                <h3 className="font-bold text-[#f6242f] text-lg mb-1">Account Required</h3>
                <p className="text-gray-700">
                  You need a DraperAds account to deploy this ad to Meta. Create your account below to continue.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Account Creation Form */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Create Your DraperAds Account</h2>
            <p className="text-gray-600 mb-6">
              Enter your email to create your account and start tracking your ad performance across all Meta platforms
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="font-medium">Email address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-3 mt-8">
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
                  disabled={isSubmitting || targetingData.adSets.length === 0}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">Creating Account...</span>
                  ) : (
                    <span className="flex items-center">
                      Create Account & Deploy Ad <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}