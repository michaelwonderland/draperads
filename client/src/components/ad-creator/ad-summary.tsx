import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AdPreview } from "./ad-preview";
import { CheckCircle2, ArrowRight, Facebook, Instagram, ChevronLeft, Eye, EyeOff } from "lucide-react";

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
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
  
  const handleContinueWithGoogle = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete(email);
      toast({
        title: "Account created with Google!",
        description: "Your DraperAds account has been created and your ad is being processed.",
      });
      setIsSubmitting(false);
    }, 1500);
  };
  
  const handleContinueWithFacebook = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete(email);
      toast({
        title: "Account created with Facebook!",
        description: "Your DraperAds account has been created and your ad is being processed.",
      });
      setIsSubmitting(false);
    }, 1500);
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
    
    if (showEmailSignup && !name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (showEmailSignup && !password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter a password to continue.",
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
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Your Ad Is Ready For Launch</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Left Column - Ad Preview */}
          <div className="md:w-1/2">
            <div className="mb-4">
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
                compact={true}
              />
            </div>
            
            {/* Distribution Details - Simplified */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h2 className="text-base font-semibold mb-3">Distribution Details</h2>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {/* Meta Account */}
                <div className="col-span-2">
                  <div className="flex items-center">
                    <div className="rounded-full bg-blue-100 p-1.5 mr-2 flex-shrink-0">
                      <Facebook className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-xs font-medium">Meta Ad Account</h3>
                      <p className="text-xs text-gray-500 truncate">
                        {targetingData.adAccountId ? `Connected (ID: ${targetingData.adAccountId})` : "Not Connected"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Campaign */}
                <div>
                  <h3 className="text-xs font-medium mb-1">Campaign</h3>
                  <Badge variant="outline" className="bg-white border-blue-200 text-blue-800 ml-0 text-xs">
                    {formatAdType(targetingData.campaignObjective || adData.adType)} 
                  </Badge>
                </div>
                
                {/* Ad Sets - Compact list */}
                <div>
                  <h3 className="text-xs font-medium mb-1">Ad Sets</h3>
                  <span className="text-xs">
                    {targetingData.adSets && targetingData.adSets.length > 0 
                      ? `${targetingData.adSets.length} selected` 
                      : "None selected"}
                  </span>
                </div>
                
                {/* Ad Sets Details */}
                {targetingData.adSets && targetingData.adSets.length > 0 && (
                  <div className="col-span-2 mt-1">
                    <div className="max-h-[100px] overflow-y-auto bg-white rounded border border-gray-200 p-2">
                      <div className="space-y-1">
                        {targetingData.adSets.map((adSet: any, index: number) => (
                          <div key={index} className="flex items-center py-0.5">
                            <CheckCircle2 className="h-3 w-3 text-green-500 mr-1.5 flex-shrink-0" />
                            <span className="text-xs truncate">{adSet.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Account Creation */}
          <div className="md:w-1/2">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Create an Account to Deploy Your Ad</h2>
              
              {!showEmailSignup ? (
                <div className="space-y-4">
                  {/* Google Sign Up */}
                  <Button 
                    onClick={handleContinueWithGoogle}
                    variant="outline" 
                    className="w-full py-6 flex justify-center items-center"
                    disabled={isSubmitting}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="h-6 w-6 mr-3" />
                    <span className="text-base">Continue with Google</span>
                  </Button>
                  
                  {/* Facebook Sign Up */}
                  <Button 
                    onClick={handleContinueWithFacebook}
                    variant="outline" 
                    className="w-full py-6 flex justify-center items-center"
                    disabled={isSubmitting}
                  >
                    <Facebook className="h-6 w-6 mr-3 text-blue-600" />
                    <span className="text-base">Continue with Facebook</span>
                  </Button>
                  
                  {/* Email Sign Up */}
                  <Button
                    onClick={() => setShowEmailSignup(true)}
                    variant="link"
                    className="w-full text-indigo-600 hover:text-indigo-800 text-base py-3"
                    disabled={isSubmitting}
                  >
                    Continue with Email
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <div className="relative">
                      <Input 
                        id="name" 
                        type="text" 
                        placeholder="Enter your name..." 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 pr-10"
                      />
                      {name && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                          onClick={() => setName("")}
                        >
                          <span className="sr-only">Clear</span>
                          <span className="text-[#f6242f]">⌫</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Email Input */}
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email address..." 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Password Input */}
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter a secure password..." 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 pr-10"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleCreateAccount}
                    className="w-full mt-6 py-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating Account..." : "Continue"}
                  </Button>
                  
                  <Button
                    onClick={() => setShowEmailSignup(false)}
                    variant="link"
                    className="flex items-center justify-center w-full text-gray-600 hover:text-gray-800"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to social login
                  </Button>
                </div>
              )}
              
              {/* Bottom navigation */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="w-full"
                >
                  Back to targeting
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}