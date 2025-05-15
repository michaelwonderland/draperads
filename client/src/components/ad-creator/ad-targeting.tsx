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
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdAccount {
  id: number;
  accountId: string;
  name: string;
}

interface AdTargetingFormData {
  adAccountId: string;
  campaignObjective: string;
  placements: string[];
  adSets: AdSetConfig[];
}

interface AdSetConfig {
  id: string;
  name: string;
  audience: string;
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
    adSets: defaultValues?.adSets || [
      { id: "set1", name: "Main Audience", audience: "Broad - 25-54 age range" },
    ],
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

  const addAdSet = () => {
    const newId = `set${formData.adSets.length + 1}`;
    setFormData(prev => ({
      ...prev,
      adSets: [...prev.adSets, { id: newId, name: `New Ad Set ${prev.adSets.length + 1}`, audience: "Default audience" }]
    }));
  };

  const removeAdSet = (id: string) => {
    setFormData(prev => ({
      ...prev,
      adSets: prev.adSets.filter(set => set.id !== id)
    }));
  };

  const updateAdSet = (id: string, field: keyof AdSetConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      adSets: prev.adSets.map(set => 
        set.id === id ? { ...set, [field]: value } : set
      )
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Distribution Settings</h2>
      <p className="text-sm text-[#65676B] mb-4">
        Configure your ad distribution settings. Create multiple ad sets to deploy your creative to different audiences.
      </p>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="ad_account" className="text-sm font-medium mb-1">Ad Account</Label>
          {isLoadingAccounts ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              onValueChange={handleAccountChange}
              defaultValue={formData.adAccountId}
            >
              <SelectTrigger id="ad_account" className="w-full">
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
            <SelectTrigger id="campaign_objective" className="w-full">
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
          <div className="space-y-2 mt-2 grid grid-cols-1 md:grid-cols-2">
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

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="placement_messenger" 
                checked={formData.placements.includes("messenger")}
                onCheckedChange={(checked) => 
                  handlePlacementChange("messenger", checked as boolean)
                }
                className="h-4 w-4 text-[#1877F2] rounded border-[#E4E6EB] focus:ring-[#1877F2]"
              />
              <label 
                htmlFor="placement_messenger" 
                className="text-sm cursor-pointer"
              >
                Messenger
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E4E6EB] pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium">Ad Sets</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 border-[#1877F2] text-[#1877F2]"
              onClick={addAdSet}
            >
              <Plus className="h-4 w-4" /> Add Ad Set
            </Button>
          </div>
          
          <div className="space-y-4">
            {formData.adSets.map((adSet) => (
              <div key={adSet.id} className="border border-[#E4E6EB] rounded-md p-4 relative">
                {formData.adSets.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-[#65676B] hover:text-red-500"
                    onClick={() => removeAdSet(adSet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`adset_name_${adSet.id}`} className="text-sm font-medium">Ad Set Name</Label>
                    <Input
                      id={`adset_name_${adSet.id}`}
                      value={adSet.name}
                      onChange={(e) => updateAdSet(adSet.id, 'name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`adset_audience_${adSet.id}`} className="text-sm font-medium">Target Audience</Label>
                    <Select
                      value={adSet.audience}
                      onValueChange={(value) => updateAdSet(adSet.id, 'audience', value)}
                    >
                      <SelectTrigger id={`adset_audience_${adSet.id}`} className="mt-1">
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Broad - 25-54 age range">Broad - 25-54 age range</SelectItem>
                        <SelectItem value="Young Adults - 18-24">Young Adults - 18-24</SelectItem>
                        <SelectItem value="Professionals - 25-40">Professionals - 25-40</SelectItem>
                        <SelectItem value="Parents">Parents</SelectItem>
                        <SelectItem value="Lookalike - Website Visitors">Lookalike - Website Visitors</SelectItem>
                        <SelectItem value="Retargeting - Website Visitors">Retargeting - Website Visitors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
