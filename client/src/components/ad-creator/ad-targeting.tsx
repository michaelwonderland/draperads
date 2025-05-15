import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

interface AdAccount {
  id: number;
  accountId: string;
  name: string;
}

interface AdTargetingFormData {
  adAccountId: string;
  campaignObjective: string;
  placements: string[];
}

interface AdTargetingProps {
  onChange: (data: AdTargetingFormData) => void;
  defaultValues?: Partial<AdTargetingFormData>;
}

export function AdTargeting({ onChange, defaultValues }: AdTargetingProps) {
  const { data: adAccounts, isLoading: isLoadingAccounts } = useQuery<AdAccount[]>({
    queryKey: ["/api/ad-accounts"],
  });

  const [formData, setFormData] = useState<AdTargetingFormData>({
    adAccountId: defaultValues?.adAccountId || "account_1",
    campaignObjective: defaultValues?.campaignObjective || "traffic",
    placements: defaultValues?.placements || ["facebook", "instagram"],
  });

  // Sync changes to parent component
  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleAccountChange = (value: string) => {
    setFormData(prev => ({ ...prev, adAccountId: value }));
  };

  const handleObjectiveChange = (value: string) => {
    setFormData(prev => ({ ...prev, campaignObjective: value }));
  };

  const handlePlacementChange = (placement: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      placements: checked
        ? [...prev.placements, placement]
        : prev.placements.filter(p => p !== placement)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Ad Set</h2>
      <p className="text-sm text-[#65676B] mb-4">Choose where your ad will run. You can change these settings later.</p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="ad_account" className="text-sm font-medium mb-1">Ad Account</Label>
          {isLoadingAccounts ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              onValueChange={handleAccountChange}
              defaultValue={formData.adAccountId}
            >
              <SelectTrigger id="ad_account" className="w-full focus:ring-[#1877F2] focus:border-[#1877F2]">
                <SelectValue placeholder="Select an ad account" />
              </SelectTrigger>
              <SelectContent>
                {adAccounts?.map(account => (
                  <SelectItem key={account.id} value={`account_${account.id}`}>
                    {account.name} (ID: {account.accountId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div>
          <Label htmlFor="campaign_objective" className="text-sm font-medium mb-1">Campaign Objective</Label>
          <Select
            onValueChange={handleObjectiveChange}
            defaultValue={formData.campaignObjective}
          >
            <SelectTrigger id="campaign_objective" className="w-full focus:ring-[#1877F2] focus:border-[#1877F2]">
              <SelectValue placeholder="Select campaign objective" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="awareness">Brand Awareness</SelectItem>
              <SelectItem value="traffic">Traffic</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="leads">Lead Generation</SelectItem>
              <SelectItem value="conversions">Conversions</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-1">Placements</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="placement_facebook" 
                checked={formData.placements.includes("facebook")}
                onCheckedChange={(checked) => 
                  handlePlacementChange("facebook", checked as boolean)
                }
                className="h-4 w-4 text-[#1877F2] rounded border-[#E4E6EB] focus:ring-[#1877F2]"
              />
              <label 
                htmlFor="placement_facebook" 
                className="text-sm cursor-pointer"
              >
                Facebook News Feed
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="placement_instagram" 
                checked={formData.placements.includes("instagram")}
                onCheckedChange={(checked) => 
                  handlePlacementChange("instagram", checked as boolean)
                }
                className="h-4 w-4 text-[#1877F2] rounded border-[#E4E6EB] focus:ring-[#1877F2]"
              />
              <label 
                htmlFor="placement_instagram" 
                className="text-sm cursor-pointer"
              >
                Instagram Feed
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="placement_stories" 
                checked={formData.placements.includes("stories")}
                onCheckedChange={(checked) => 
                  handlePlacementChange("stories", checked as boolean)
                }
                className="h-4 w-4 text-[#1877F2] rounded border-[#E4E6EB] focus:ring-[#1877F2]"
              />
              <label 
                htmlFor="placement_stories" 
                className="text-sm cursor-pointer"
              >
                Stories
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
