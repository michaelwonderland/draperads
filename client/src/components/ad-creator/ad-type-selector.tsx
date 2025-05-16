import { useState } from "react";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Users, Target } from "lucide-react";

interface AdTypeData {
  adType: string;
  customizePlacements: boolean;
}

interface AdTypeSelectorProps {
  onChange: (data: AdTypeData) => void;
  defaultValues?: Partial<AdTypeData>;
}

export function AdTypeSelector({ 
  onChange, 
  defaultValues = { 
    adType: "standard_conversion",
    customizePlacements: false
  } 
}: AdTypeSelectorProps) {
  const [adType, setAdType] = useState(defaultValues.adType || "standard_conversion");
  const [customizePlacements, setCustomizePlacements] = useState(defaultValues.customizePlacements || false);

  const handleAdTypeChange = (value: string) => {
    setAdType(value);
    onChange({
      adType: value,
      customizePlacements
    });
  };

  const handleCustomizePlacementsChange = (checked: boolean) => {
    setCustomizePlacements(checked);
    onChange({
      adType,
      customizePlacements: checked
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Ad Type</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select the type of ad you want to create. This will determine the options available.
        </p>
        <RadioGroup 
          value={adType} 
          onValueChange={handleAdTypeChange}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <RadioGroupItem 
              value="standard_conversion" 
              id="standard_conversion" 
              className="sr-only" 
            />
            <Label 
              htmlFor="standard_conversion"
              className="cursor-pointer"
            >
              <Card className={`h-full ${adType === "standard_conversion" ? "border-2 border-[#f6242f]" : ""}`}>
                <CardHeader className="pb-2">
                  <Target className="h-8 w-8 text-[#f6242f] mb-2" />
                  <CardTitle className="text-base">Standard Conversion Ad</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    Drive conversions like website visits, purchases, and sign-ups.
                  </CardDescription>
                </CardContent>
              </Card>
            </Label>
          </div>

          <div>
            <RadioGroupItem 
              value="lead_generation" 
              id="lead_generation" 
              className="sr-only" 
            />
            <Label 
              htmlFor="lead_generation"
              className="cursor-pointer"
            >
              <Card className={`h-full ${adType === "lead_generation" ? "border-2 border-[#f6242f]" : ""}`}>
                <CardHeader className="pb-2">
                  <Users className="h-8 w-8 text-[#f6242f] mb-2" />
                  <CardTitle className="text-base">Lead Generation Ad</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    Collect user information through a form without them leaving Meta platforms.
                  </CardDescription>
                </CardContent>
              </Card>
            </Label>
          </div>

          <div>
            <RadioGroupItem 
              value="reach" 
              id="reach" 
              className="sr-only" 
            />
            <Label 
              htmlFor="reach"
              className="cursor-pointer"
            >
              <Card className={`h-full ${adType === "reach" ? "border-2 border-[#f6242f]" : ""}`}>
                <CardHeader className="pb-2">
                  <Megaphone className="h-8 w-8 text-[#f6242f] mb-2" />
                  <CardTitle className="text-base">Reach Ad</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    Maximize your ad visibility to as many people as possible in your target audience.
                  </CardDescription>
                </CardContent>
              </Card>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Placement Asset Customization</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create different versions of your ad for different placements (Feed, Stories, etc.)
            </p>
          </div>
          <Switch 
            checked={customizePlacements}
            onCheckedChange={handleCustomizePlacementsChange}
          />
        </div>
      </div>
    </div>
  );
}